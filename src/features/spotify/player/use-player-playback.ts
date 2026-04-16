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
import {
  EMPTY_PLAYER_QUEUE_STATE,
  createSingleTrackQueueState,
  createTrackListQueueState,
  getNextQueueSelection,
  getPrevQueueSelection,
  getQueueIndexForTrack,
  shouldAutoAdvanceFromSdkState,
  toggleShuffleState,
} from "./player-queue-state";
import { usePlayerPlaybackTransport } from "./use-player-playback-transport";

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
  const [queueState, setQueueState] = useState(EMPTY_PLAYER_QUEUE_STATE);
  const { queue, queueIndex, shuffled } = queueState;
  const hasQueue = queue.length > 1;

  const trackId = streakTrackId ?? currentTrack?.id ?? null;
  const {
    cancelPendingPlayback,
    paused,
    setVolume,
    startPlayback,
    togglePlay,
    volume,
  } = usePlayerPlaybackTransport({
    canControlPlayback,
    getAccessToken,
    initSpotify,
    pause,
    play,
    resume,
    sdkState,
    setRepeat,
    setSpotifyVolume,
    streakTrackId,
    trackId,
    waitForReady,
  });

  const playTrack = useCallback(
    async (track: Track) => {
      if (!canControlPlayback || streakActive) return;

      const nextQueueState = createSingleTrackQueueState(track);
      await startPlayback({
        track,
        onAccepted: () => {
          setCurrentTrack(track);
          setQueueState(nextQueueState);
        },
      });
    },
    [canControlPlayback, setCurrentTrack, startPlayback, streakActive],
  );

  const playTracks = useCallback(
    async (tracks: Track[], startIndex = 0) => {
      if (!canControlPlayback || streakActive || tracks.length === 0) return;

      const nextQueueState = createTrackListQueueState(
        tracks,
        startIndex,
        shuffled,
      );
      const track = tracks[startIndex];

      await startPlayback({
        track,
        onAccepted: () => {
          setCurrentTrack(track);
          setQueueState(nextQueueState);
        },
      });
    },
    [canControlPlayback, setCurrentTrack, shuffled, startPlayback, streakActive],
  );

  const nextTrack = useCallback(async () => {
    if (!canControlPlayback || streakActive || queue.length <= 1) return;

    const selection = getNextQueueSelection(queueState);
    if (!selection) return;

    await startPlayback({
      track: selection.track,
      onAccepted: () => {
        setCurrentTrack(selection.track);
        setQueueState(selection.nextState);
      },
    });
  }, [
    canControlPlayback,
    queue.length,
    queueState,
    setCurrentTrack,
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
    const selection = getPrevQueueSelection(queueState, pos);
    if (!selection) return;

    await startPlayback({
      track: selection.track,
      onAccepted: () => {
        setCurrentTrack(selection.track);
        setQueueState(selection.nextState);
      },
    });
  }, [
    canControlPlayback,
    progressMs,
    queue.length,
    queueState,
    sdkState?.position,
    setCurrentTrack,
    startPlayback,
    streakActive,
  ]);

  const toggleShuffle = useCallback(() => {
    setQueueState((current) => toggleShuffleState(current));
  }, []);

  const clearPlaybackAfterBrokenStreak = useCallback(() => {
    cancelPendingPlayback();
    void pause().catch(() => {});
    setCurrentTrack(null);
    setQueueState(EMPTY_PLAYER_QUEUE_STATE);
  }, [cancelPendingPlayback, pause, setCurrentTrack]);

  const restoreTrackAfterSurrender = useCallback(
    (track: Track) => {
      setCurrentTrack(track);

      setQueueState((current) => {
        const restoredQueueIndex = getQueueIndexForTrack(current, track.id);
        if (restoredQueueIndex === -1) {
          return current;
        }

        return {
          ...current,
          queueIndex: restoredQueueIndex,
        };
      });
    },
    [setCurrentTrack],
  );

  const prevSdkStateRef = useRef<SdkPlaybackState | null>(null);
  useEffect(() => {
    const prev = prevSdkStateRef.current;
    prevSdkStateRef.current = sdkState;

    if (streakActive || queue.length <= 1 || !sdkState || !prev) return;
    if (shouldAutoAdvanceFromSdkState(prev, sdkState)) {
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
