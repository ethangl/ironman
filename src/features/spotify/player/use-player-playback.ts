import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { Track } from "@/types";
import type { PlayResult, SdkPlaybackState } from "@/types/spotify-playback";
import { toast } from "sonner";

function getPlaybackFailureMessage(status: number) {
  switch (status) {
    case 401:
      return "Your Spotify session expired. Reconnect Spotify and try again.";
    case 403:
      return "Spotify blocked this action. Premium or additional permissions may be required.";
    case 429:
      return "Spotify is rate limiting playback right now. Please wait a bit and try again.";
    case 404:
      return "No active Spotify device was available.";
    default:
      return "Spotify could not complete that action right now.";
  }
}

function generateShuffleOrder(length: number, pinIndex: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const pos = order.indexOf(pinIndex);
  if (pos !== 0) {
    [order[0], order[pos]] = [order[pos], order[0]];
  }

  return order;
}

export function usePlayerPlayback({
  canControlPlayback,
  currentTrack,
  getAccessToken,
  initSpotify,
  pause,
  play,
  progressMs,
  resume,
  sdkState,
  setCurrentTrack,
  setRepeat,
  setSpotifyVolume,
  streakActive,
  streakTrackId,
  waitForReady,
}: {
  canControlPlayback: boolean;
  currentTrack: Track | null;
  getAccessToken: () => Promise<string | null>;
  initSpotify: () => void;
  pause: () => Promise<PlayResult>;
  play: (uri: string, deviceId?: string) => Promise<PlayResult>;
  progressMs: number;
  resume: () => Promise<PlayResult>;
  sdkState: SdkPlaybackState | null;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  setRepeat: (state: string, deviceId?: string) => Promise<void>;
  setSpotifyVolume: (val: number) => Promise<void>;
  streakActive: boolean;
  streakTrackId: string | null;
  waitForReady: () => Promise<string | null>;
}) {
  const [apiPaused, setApiPaused] = useState(true);
  const [volume, setVolumeState] = useState(50);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const playbackAttemptRef = useRef(0);
  const startPlaybackInFlightRef = useRef(false);
  const activePlaybackTrackRef = useRef<Track | null>(null);
  const queuedPlaybackTrackRef = useRef<Track | null>(null);
  const hasQueue = queue.length > 1;

  const trackId = streakTrackId ?? currentTrack?.id ?? null;
  const paused = sdkState ? sdkState.paused : apiPaused;

  const runPlaybackAttempt = useCallback(
    async (track: Track) => {
      if (!canControlPlayback) return;

      activePlaybackTrackRef.current = track;
      const attemptId = ++playbackAttemptRef.current;
      const isLatestAttempt = () => playbackAttemptRef.current === attemptId;

      const token = await getAccessToken();
      if (!token) return;

      initSpotify();
      setCurrentTrack(track);

      const uri = `spotify:track:${track.id}`;
      const res = await play(uri);

      if (res.ok) {
        if (isLatestAttempt()) {
          setApiPaused(false);
        }
        return;
      }

      if (res.status === 404) {
        const sdkDeviceId = await waitForReady();
        if (!isLatestAttempt()) return;
        if (!sdkDeviceId) {
          toast.error(
            "Could not start playback. Please open Spotify on a device and try again.",
          );
          setCurrentTrack(null);
          return;
        }

        for (let attempt = 0; attempt < 2; attempt++) {
          if (!isLatestAttempt()) return;
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 750));
          }

          try {
            const playRes = await play(uri, sdkDeviceId);
            if (playRes.ok) {
              if (isLatestAttempt()) {
                setApiPaused(false);
              }
              return;
            }
          } catch {
            // Retry once more before surfacing a device/playback failure.
          }
        }

        toast.error(
          "Could not start playback. Please open Spotify on a device and try again.",
        );
        setCurrentTrack(null);
        return;
      }

      if (isLatestAttempt()) {
        toast.error(getPlaybackFailureMessage(res.status));
      }
    },
    [canControlPlayback, getAccessToken, initSpotify, play, waitForReady],
  );

  const startPlayback = useCallback(
    async (track: Track) => {
      if (startPlaybackInFlightRef.current) {
        const sameAsActive = activePlaybackTrackRef.current?.id === track.id;
        const sameAsQueued = queuedPlaybackTrackRef.current?.id === track.id;
        if (!sameAsActive && !sameAsQueued) {
          queuedPlaybackTrackRef.current = track;
        }
        return;
      }

      startPlaybackInFlightRef.current = true;
      let nextTrack: Track | null = track;

      try {
        while (nextTrack) {
          queuedPlaybackTrackRef.current = null;
          await runPlaybackAttempt(nextTrack);
          nextTrack = queuedPlaybackTrackRef.current;
        }
      } finally {
        startPlaybackInFlightRef.current = false;
        activePlaybackTrackRef.current = null;
        queuedPlaybackTrackRef.current = null;
      }
    },
    [runPlaybackAttempt],
  );

  const playTrack = useCallback(
    async (track: Track) => {
      setQueue([track]);
      setQueueIndex(0);
      setShuffled(false);
      setShuffleOrder([]);
      await startPlayback(track);
    },
    [startPlayback],
  );

  const playTracks = useCallback(
    async (tracks: Track[], startIndex = 0) => {
      if (tracks.length === 0) return;

      setQueue(tracks);
      if (shuffled) {
        const order = generateShuffleOrder(tracks.length, startIndex);
        setShuffleOrder(order);
        setQueueIndex(0);
      } else {
        setQueueIndex(startIndex);
      }

      await startPlayback(tracks[startIndex]);
    },
    [shuffled, startPlayback],
  );

  const nextTrack = useCallback(async () => {
    if (!canControlPlayback || streakActive || queue.length <= 1) return;

    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    const effectiveIdx = shuffled
      ? (shuffleOrder[nextIdx] ?? nextIdx)
      : nextIdx;
    await startPlayback(queue[effectiveIdx]);
  }, [
    canControlPlayback,
    queue,
    queueIndex,
    shuffled,
    shuffleOrder,
    startPlayback,
    streakActive,
  ]);

  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(async () => {
    if (!canControlPlayback || streakActive || queue.length <= 1) return;

    const pos = sdkState?.position ?? progressMs;
    if (pos > 3000) {
      const effectiveIdx = shuffled
        ? (shuffleOrder[queueIndex] ?? queueIndex)
        : queueIndex;
      await startPlayback(queue[effectiveIdx]);
      return;
    }

    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    const effectiveIdx = shuffled
      ? (shuffleOrder[prevIdx] ?? prevIdx)
      : prevIdx;
    await startPlayback(queue[effectiveIdx]);
  }, [
    canControlPlayback,
    progressMs,
    queue,
    queueIndex,
    sdkState?.position,
    shuffled,
    shuffleOrder,
    startPlayback,
    streakActive,
  ]);

  const toggleShuffle = useCallback(() => {
    if (queue.length <= 1) return;

    if (!shuffled) {
      const currentEffective = queueIndex;
      const order = generateShuffleOrder(queue.length, currentEffective);
      setShuffleOrder(order);
      setQueueIndex(0);
    } else {
      const effectiveIdx = shuffleOrder[queueIndex] ?? queueIndex;
      setQueueIndex(effectiveIdx);
      setShuffleOrder([]);
    }

    setShuffled((current) => !current);
  }, [queue.length, queueIndex, shuffled, shuffleOrder]);

  const togglePlay = useCallback(async () => {
    if (!canControlPlayback) return;

    if (paused) {
      const res = await resume();
      if (res.ok) {
        setApiPaused(false);
        return;
      }

      if (res.status === 404 && trackId) {
        const token = await getAccessToken();
        if (!token) {
          toast.error(
            "Your Spotify session expired. Reconnect Spotify and try again.",
          );
          return;
        }

        initSpotify();
        const deviceId = await waitForReady();
        if (deviceId) {
          let playRes: Awaited<ReturnType<typeof play>>;
          try {
            playRes = await play(`spotify:track:${trackId}`, deviceId);
          } catch {
            toast.error(getPlaybackFailureMessage(500));
            return;
          }

          if (playRes.ok) {
            if (streakTrackId) {
              await setRepeat("track", deviceId).catch(() => {
                // Keep the resumed playback even if repeat restoration fails.
              });
            }
            setApiPaused(false);
            return;
          }

          toast.error(getPlaybackFailureMessage(playRes.status));
        } else {
          toast.error(
            "Could not resume playback. Please open Spotify on a device and try again.",
          );
        }
      } else {
        toast.error(getPlaybackFailureMessage(res.status));
      }
    } else {
      const res = await pause();
      if (res.ok) {
        setApiPaused(true);
      } else {
        toast.error(getPlaybackFailureMessage(res.status));
      }
    }
  }, [
    canControlPlayback,
    getAccessToken,
    initSpotify,
    pause,
    paused,
    play,
    resume,
    setRepeat,
    streakTrackId,
    trackId,
    waitForReady,
  ]);

  const setVolume = useCallback(
    async (value: number) => {
      setVolumeState(value);
      await setSpotifyVolume(value);
    },
    [setSpotifyVolume],
  );

  const clearPlaybackAfterBrokenStreak = useCallback(() => {
    playbackAttemptRef.current += 1;
    activePlaybackTrackRef.current = null;
    queuedPlaybackTrackRef.current = null;
    void pause();
    setCurrentTrack(null);
    setQueue([]);
    setQueueIndex(0);
  }, [pause]);

  const restoreTrackAfterSurrender = useCallback(
    (track: Track) => {
      setCurrentTrack(track);

      if (queue.length <= 1) return;

      const idx = queue.findIndex((queuedTrack) => queuedTrack.id === track.id);
      if (idx === -1) return;

      const effectiveQueueIdx = shuffled ? shuffleOrder.indexOf(idx) : idx;
      if (effectiveQueueIdx !== -1) {
        setQueueIndex(effectiveQueueIdx);
      }
    },
    [queue, shuffled, shuffleOrder],
  );

  const prevSdkStateRef = useRef<SdkPlaybackState | null>(null);
  useEffect(() => {
    const prev = prevSdkStateRef.current;
    prevSdkStateRef.current = sdkState;

    if (streakActive || queue.length <= 1 || !sdkState || !prev) return;
    if (prev.paused) return;

    const wasNearEnd = prev.position > prev.duration * 0.9;
    const resetToStart = sdkState.position < prev.duration * 0.1;
    const trackUnchanged = sdkState.trackId === prev.trackId;

    if (wasNearEnd && resetToStart && trackUnchanged) {
      void nextTrackRef.current();
    }
  }, [queue.length, sdkState, streakActive]);

  return {
    clearPlaybackAfterBrokenStreak,
    hasQueue,
    paused,
    playTrack,
    playTracks,
    prevTrack,
    queue,
    queueIndex,
    restoreTrackAfterSurrender,
    setVolume,
    shuffled,
    togglePlay,
    toggleShuffle,
    nextTrack,
    volume,
  };
}
