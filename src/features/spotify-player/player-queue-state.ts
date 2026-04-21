import type { Track } from "@/features/spotify-client/types";
import type { SdkPlaybackState } from "@/features/spotify-client/playback-types";

export interface PlayerQueueState {
  queue: Track[];
  queueIndex: number;
  shuffled: boolean;
  shuffleOrder: number[];
}

export interface PlayerQueueSelection {
  track: Track;
  nextState: PlayerQueueState;
}

export const EMPTY_PLAYER_QUEUE_STATE: PlayerQueueState = {
  queue: [],
  queueIndex: 0,
  shuffled: false,
  shuffleOrder: [],
};

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

export function createSingleTrackQueueState(track: Track): PlayerQueueState {
  return {
    queue: [track],
    queueIndex: 0,
    shuffled: false,
    shuffleOrder: [],
  };
}

export function createTrackListQueueState(
  tracks: Track[],
  startIndex: number,
  shuffled: boolean,
): PlayerQueueState {
  if (!shuffled) {
    return {
      queue: tracks,
      queueIndex: startIndex,
      shuffled: false,
      shuffleOrder: [],
    };
  }

  return {
    queue: tracks,
    queueIndex: 0,
    shuffled: true,
    shuffleOrder: generateShuffleOrder(tracks.length, startIndex),
  };
}

export function getQueueTrack(
  state: PlayerQueueState,
  queueIndex = state.queueIndex,
): Track | null {
  if (state.queue.length === 0) {
    return null;
  }

  const effectiveIndex = state.shuffled
    ? (state.shuffleOrder[queueIndex] ?? queueIndex)
    : queueIndex;

  return state.queue[effectiveIndex] ?? null;
}

export function getNextQueueSelection(
  state: PlayerQueueState,
): PlayerQueueSelection | null {
  if (state.queue.length <= 1) {
    return null;
  }

  const nextIndex = (state.queueIndex + 1) % state.queue.length;
  const nextState = {
    ...state,
    queueIndex: nextIndex,
  };
  const track = getQueueTrack(nextState);

  if (!track) {
    return null;
  }

  return {
    track,
    nextState,
  };
}

export function getPrevQueueSelection(
  state: PlayerQueueState,
  positionMs: number,
): PlayerQueueSelection | null {
  if (state.queue.length <= 1) {
    return null;
  }

  if (positionMs > 3000) {
    const track = getQueueTrack(state);
    if (!track) {
      return null;
    }

    return {
      track,
      nextState: state,
    };
  }

  const prevIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
  const nextState = {
    ...state,
    queueIndex: prevIndex,
  };
  const track = getQueueTrack(nextState);

  if (!track) {
    return null;
  }

  return {
    track,
    nextState,
  };
}

export function toggleShuffleState(state: PlayerQueueState): PlayerQueueState {
  if (state.queue.length <= 1) {
    return state;
  }

  if (!state.shuffled) {
    return {
      ...state,
      shuffled: true,
      queueIndex: 0,
      shuffleOrder: generateShuffleOrder(state.queue.length, state.queueIndex),
    };
  }

  return {
    ...state,
    shuffled: false,
    queueIndex: state.shuffleOrder[state.queueIndex] ?? state.queueIndex,
    shuffleOrder: [],
  };
}

export function getQueueIndexForTrack(
  state: PlayerQueueState,
  trackId: string,
): number {
  if (state.queue.length <= 1) {
    return -1;
  }

  const effectiveIndex = state.queue.findIndex((track) => track.id === trackId);
  if (effectiveIndex === -1) {
    return -1;
  }

  return state.shuffled
    ? state.shuffleOrder.indexOf(effectiveIndex)
    : effectiveIndex;
}

export function shouldAutoAdvanceFromSdkState(
  previousState: SdkPlaybackState | null,
  sdkState: SdkPlaybackState | null,
): boolean {
  if (!previousState || !sdkState || previousState.paused) {
    return false;
  }

  const wasNearEnd = previousState.position > previousState.duration * 0.9;
  const resetToStart = sdkState.position < previousState.duration * 0.1;
  const trackUnchanged = sdkState.trackId === previousState.trackId;

  return wasNearEnd && resetToStart && trackUnchanged;
}
