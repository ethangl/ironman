import { useCallback, useRef, useState } from "react";

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

interface PlaybackStartRequest {
  track: Track;
  onAccepted: () => void;
  offsetMs?: number;
}

export function usePlayerPlaybackTransport({
  canControlPlayback,
  getAccessToken,
  initSpotify,
  pause,
  play,
  resume,
  sdkState,
  setSpotifyVolume,
  trackId,
  waitForReady,
}: {
  canControlPlayback: boolean;
  getAccessToken: () => Promise<string | null>;
  initSpotify: () => void;
  pause: () => Promise<PlayResult>;
  play: (uri: string, deviceId?: string, offsetMs?: number) => Promise<PlayResult>;
  resume: () => Promise<PlayResult>;
  sdkState: SdkPlaybackState | null;
  setSpotifyVolume: (val: number) => Promise<void>;
  trackId: string | null;
  waitForReady: () => Promise<string | null>;
}) {
  const [apiPaused, setApiPaused] = useState(true);
  const [volume, setVolumeState] = useState(50);
  const playbackAttemptRef = useRef(0);
  const startPlaybackInFlightRef = useRef(false);
  const activePlaybackRequestRef = useRef<PlaybackStartRequest | null>(null);
  const queuedPlaybackRequestRef = useRef<PlaybackStartRequest | null>(null);
  const paused = sdkState ? sdkState.paused : apiPaused;

  const runPlaybackAttempt = useCallback(
    async (request: PlaybackStartRequest) => {
      if (!canControlPlayback) {
        return false;
      }

      activePlaybackRequestRef.current = request;
      const attemptId = ++playbackAttemptRef.current;
      const isLatestAttempt = () => playbackAttemptRef.current === attemptId;

      const token = await getAccessToken();
      if (!token) {
        return false;
      }

      initSpotify();

      const uri = `spotify:track:${request.track.id}`;
      let initialPlayResult: PlayResult;
      try {
        initialPlayResult = await play(uri, undefined, request.offsetMs);
      } catch {
        if (isLatestAttempt()) {
          toast.error(getPlaybackFailureMessage(500));
        }
        return false;
      }

      if (initialPlayResult.ok) {
        if (isLatestAttempt()) {
          request.onAccepted();
          setApiPaused(false);
        }
        return true;
      }

      if (initialPlayResult.status === 404) {
        const sdkDeviceId = await waitForReady();
        if (!isLatestAttempt()) {
          return false;
        }
        if (!sdkDeviceId) {
          toast.error(
            "Could not start playback. Please open Spotify on a device and try again.",
          );
          return false;
        }

        let fallbackStatus: number | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          if (!isLatestAttempt()) {
            return false;
          }
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 750));
          }

          try {
            const playResult = await play(uri, sdkDeviceId, request.offsetMs);
            if (playResult.ok) {
              if (isLatestAttempt()) {
                request.onAccepted();
                setApiPaused(false);
              }
              return true;
            }

            fallbackStatus = playResult.status;
            if (playResult.status !== 404) {
              break;
            }
          } catch {
            fallbackStatus = 500;
          }
        }

        if (isLatestAttempt()) {
          if (fallbackStatus && fallbackStatus !== 404) {
            toast.error(getPlaybackFailureMessage(fallbackStatus));
          } else {
            toast.error(
              "Could not start playback. Please open Spotify on a device and try again.",
            );
          }
        }
        return false;
      }

      if (isLatestAttempt()) {
        toast.error(getPlaybackFailureMessage(initialPlayResult.status));
      }
      return false;
    },
    [canControlPlayback, getAccessToken, initSpotify, play, waitForReady],
  );

  const startPlayback = useCallback(
    async (request: PlaybackStartRequest) => {
      if (startPlaybackInFlightRef.current) {
        const sameAsActive =
          activePlaybackRequestRef.current?.track.id === request.track.id;
        const sameAsQueued =
          queuedPlaybackRequestRef.current?.track.id === request.track.id;
        if (!sameAsActive && !sameAsQueued) {
          queuedPlaybackRequestRef.current = request;
        }
        return;
      }

      startPlaybackInFlightRef.current = true;
      let nextRequest: PlaybackStartRequest | null = request;

      try {
        while (nextRequest) {
          queuedPlaybackRequestRef.current = null;
          await runPlaybackAttempt(nextRequest);
          nextRequest = queuedPlaybackRequestRef.current;
        }
      } finally {
        startPlaybackInFlightRef.current = false;
        activePlaybackRequestRef.current = null;
        queuedPlaybackRequestRef.current = null;
      }
    },
    [runPlaybackAttempt],
  );

  const togglePlay = useCallback(async () => {
    if (!canControlPlayback) {
      return;
    }

    if (paused) {
      try {
        const resumeResult = await resume();
        if (resumeResult.ok) {
          setApiPaused(false);
          return;
        }

        if (resumeResult.status === 404 && trackId) {
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
            let playResult: Awaited<ReturnType<typeof play>>;
            try {
              playResult = await play(`spotify:track:${trackId}`, deviceId);
            } catch {
              toast.error(getPlaybackFailureMessage(500));
              return;
            }

            if (playResult.ok) {
              setApiPaused(false);
              return;
            }

            toast.error(getPlaybackFailureMessage(playResult.status));
            return;
          }

          toast.error(
            "Could not resume playback. Please open Spotify on a device and try again.",
          );
          return;
        }

        toast.error(getPlaybackFailureMessage(resumeResult.status));
      } catch {
        toast.error(getPlaybackFailureMessage(500));
      }
      return;
    }

    try {
      const pauseResult = await pause();
      if (pauseResult.ok) {
        setApiPaused(true);
      } else {
        toast.error(getPlaybackFailureMessage(pauseResult.status));
      }
    } catch {
      toast.error(getPlaybackFailureMessage(500));
    }
  }, [
    canControlPlayback,
    getAccessToken,
    initSpotify,
    pause,
    paused,
    play,
    resume,
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

  const cancelPendingPlayback = useCallback(() => {
    playbackAttemptRef.current += 1;
    activePlaybackRequestRef.current = null;
    queuedPlaybackRequestRef.current = null;
  }, []);

  return {
    cancelPendingPlayback,
    paused,
    setVolume,
    startPlayback,
    togglePlay,
    volume,
  };
}
