export interface RoomQueueItemSnapshot<TId extends string = string> {
  _id: TId;
  position: number;
  trackDurationMs: number;
}

export interface RoomPlaybackStateSnapshot<TId extends string = string> {
  currentQueueItemId: TId | null;
  startedAt: number | null;
  startOffsetMs: number;
  paused: boolean;
  pausedAt: number | null;
}

export interface ResolvedRoomPlaybackState<TId extends string = string>
  extends RoomPlaybackStateSnapshot<TId> {
  currentOffsetMs: number;
}

function clampOffset(offsetMs: number, durationMs: number) {
  if (!Number.isFinite(offsetMs)) {
    return 0;
  }

  return Math.max(0, Math.min(offsetMs, Math.max(durationMs, 0)));
}

export function sortRoomQueueItems<T extends RoomQueueItemSnapshot>(
  queueItems: readonly T[],
) {
  return [...queueItems].sort(
    (left, right) =>
      left.position - right.position ||
      String(left._id).localeCompare(String(right._id)),
  );
}

function advanceRoomPlaybackState<TId extends string>(
  queueItems: readonly RoomQueueItemSnapshot<TId>[],
  playbackState: RoomPlaybackStateSnapshot<TId>,
  targetTime: number,
) {
  const orderedQueueItems = sortRoomQueueItems(queueItems);
  if (orderedQueueItems.length === 0) {
    return {
      currentQueueItemId: null,
      startedAt: null,
      startOffsetMs: 0,
      currentOffsetMs: 0,
    };
  }

  const currentQueueItemIndex = orderedQueueItems.findIndex(
    (queueItem) => queueItem._id === playbackState.currentQueueItemId,
  );
  if (currentQueueItemIndex < 0) {
    return {
      currentQueueItemId: orderedQueueItems[0]!._id,
      startedAt: null,
      startOffsetMs: 0,
      currentOffsetMs: 0,
    };
  }

  let queueIndex = currentQueueItemIndex;
  let startedAt = playbackState.startedAt;
  let startOffsetMs = Math.max(0, playbackState.startOffsetMs);

  if (startedAt === null) {
    const queueItem = orderedQueueItems[queueIndex]!;
    return {
      currentQueueItemId: queueItem._id,
      startedAt: null,
      startOffsetMs,
      currentOffsetMs: clampOffset(startOffsetMs, queueItem.trackDurationMs),
    };
  }

  let currentOffsetMs =
    startOffsetMs + Math.max(0, targetTime - Math.max(0, startedAt));

  while (queueIndex < orderedQueueItems.length) {
    const queueItem = orderedQueueItems[queueIndex]!;
    if (currentOffsetMs < queueItem.trackDurationMs) {
      return {
        currentQueueItemId: queueItem._id,
        startedAt,
        startOffsetMs,
        currentOffsetMs,
      };
    }

    currentOffsetMs -= queueItem.trackDurationMs;
    queueIndex += 1;
    startedAt = targetTime - currentOffsetMs;
    startOffsetMs = 0;
  }

  return {
    currentQueueItemId: null,
    startedAt: null,
    startOffsetMs: 0,
    currentOffsetMs: 0,
  };
}

export function resolveRoomPlaybackState<TId extends string>(
  queueItems: readonly RoomQueueItemSnapshot<TId>[],
  playbackState: RoomPlaybackStateSnapshot<TId>,
  now: number,
): ResolvedRoomPlaybackState<TId> {
  const resolutionTime = playbackState.paused
    ? (playbackState.pausedAt ?? now)
    : now;
  const advancedState = advanceRoomPlaybackState(
    queueItems,
    playbackState,
    resolutionTime,
  );

  if (advancedState.currentQueueItemId === null) {
    return {
      currentQueueItemId: null,
      startedAt: null,
      startOffsetMs: 0,
      paused: true,
      pausedAt: now,
      currentOffsetMs: 0,
    };
  }

  if (playbackState.paused) {
    return {
      currentQueueItemId: advancedState.currentQueueItemId,
      startedAt: advancedState.startedAt ?? (playbackState.pausedAt ?? now),
      startOffsetMs: advancedState.currentOffsetMs,
      paused: true,
      pausedAt: playbackState.pausedAt ?? now,
      currentOffsetMs: advancedState.currentOffsetMs,
    };
  }

  if (advancedState.startedAt === null) {
    return {
      currentQueueItemId: advancedState.currentQueueItemId,
      startedAt: now,
      startOffsetMs: advancedState.currentOffsetMs,
      paused: false,
      pausedAt: null,
      currentOffsetMs: advancedState.currentOffsetMs,
    };
  }

  return {
    currentQueueItemId: advancedState.currentQueueItemId,
    startedAt: advancedState.startedAt,
    startOffsetMs: advancedState.startOffsetMs,
    paused: false,
    pausedAt: null,
    currentOffsetMs: advancedState.currentOffsetMs,
  };
}

export function normalizeRoomPlaybackForContinuousStream<TId extends string>(
  queueItems: readonly RoomQueueItemSnapshot<TId>[],
  playbackState: RoomPlaybackStateSnapshot<TId>,
  now: number,
): RoomPlaybackStateSnapshot<TId> {
  const orderedQueueItems = sortRoomQueueItems(queueItems);

  if (orderedQueueItems.length === 0) {
    return playbackState;
  }

  if (
    !playbackState.paused &&
    playbackState.currentQueueItemId !== null &&
    playbackState.startedAt !== null
  ) {
    return playbackState;
  }

  const resumedPlaybackState = resolveRoomPlaybackState(
    orderedQueueItems,
    {
      ...playbackState,
      paused: false,
      pausedAt: null,
    },
    now,
  );

  return {
    currentQueueItemId: resumedPlaybackState.currentQueueItemId,
    startedAt: resumedPlaybackState.startedAt ?? now,
    startOffsetMs: resumedPlaybackState.startOffsetMs,
    paused: false,
    pausedAt: null,
  };
}

export function moveRoomQueueItemIds<TId extends string>(
  queueItemIds: readonly TId[],
  queueItemId: TId,
  targetIndex: number,
) {
  const currentIndex = queueItemIds.indexOf(queueItemId);
  if (currentIndex < 0) {
    throw new Error("Queue item not found.");
  }

  const boundedTargetIndex = Math.max(
    0,
    Math.min(Math.trunc(targetIndex), queueItemIds.length - 1),
  );
  const nextQueueItemIds = [...queueItemIds];
  nextQueueItemIds.splice(currentIndex, 1);
  nextQueueItemIds.splice(boundedTargetIndex, 0, queueItemId);
  return nextQueueItemIds;
}
