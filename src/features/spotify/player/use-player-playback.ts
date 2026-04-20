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
  setSpotifyVolume,
  waitForReady,
}: {
  canControlPlayback: boolean;
  currentTrack: Track | null;
  getAccessToken: () => Promise<string | null>;
  initSpotify: () => void;
  pause: () => Promise<PlayResult>;
  play: (uri: string, deviceId?: string, offsetMs?: number) => Promise<PlayResult>;
  progressMs: number;
  resume: () => Promise<PlayResult>;
  sdkState: SdkPlaybackState | null;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  setSpotifyVolume: (val: number) => Promise<void>;
  waitForReady: () => Promise<string | null>;
}) {
  const [queueState, setQueueState] = useState(EMPTY_PLAYER_QUEUE_STATE);
  const { queue, queueIndex, shuffled } = queueState;
  const hasQueue = queue.length > 1;

  const {
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
    setSpotifyVolume,
    trackId: currentTrack?.id ?? null,
    waitForReady,
  });

  const playTrack = useCallback(
    async (track: Track) => {
      if (!canControlPlayback) return;

      const nextQueueState = createSingleTrackQueueState(track);
      await startPlayback({
        track,
        onAccepted: () => {
          setCurrentTrack(track);
          setQueueState(nextQueueState);
        },
      });
    },
    [canControlPlayback, setCurrentTrack, startPlayback],
  );

  const syncTrack = useCallback(
    async (track: Track, offsetMs = 0) => {
      if (!canControlPlayback) return;

      const nextQueueState = createSingleTrackQueueState(track);
      await startPlayback({
        track,
        offsetMs,
        onAccepted: () => {
          setCurrentTrack(track);
          setQueueState(nextQueueState);
        },
      });
    },
    [canControlPlayback, setCurrentTrack, startPlayback],
  );

  const playTracks = useCallback(
    async (tracks: Track[], startIndex = 0) => {
      if (!canControlPlayback || tracks.length === 0) return;

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
    [canControlPlayback, setCurrentTrack, shuffled, startPlayback],
  );

  const nextTrack = useCallback(async () => {
    if (!canControlPlayback || queue.length <= 1) return;

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
  ]);

  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(async () => {
    if (!canControlPlayback || queue.length <= 1) return;

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
  ]);

  const toggleShuffle = useCallback(() => {
    setQueueState((current) => toggleShuffleState(current));
  }, []);

  const prevSdkStateRef = useRef<SdkPlaybackState | null>(null);
  useEffect(() => {
    const prev = prevSdkStateRef.current;
    prevSdkStateRef.current = sdkState;

    if (queue.length <= 1 || !sdkState || !prev) return;
    if (shouldAutoAdvanceFromSdkState(prev, sdkState)) {
      void nextTrackRef.current();
    }
  }, [queue.length, sdkState]);

  return {
    hasQueue,
    paused,
    playTrack,
    playTracks,
    prevTrack,
    queue,
    queueIndex,
    setVolume,
    shuffled,
    syncTrack,
    togglePlay,
    toggleShuffle,
    nextTrack,
    volume,
  };
}
