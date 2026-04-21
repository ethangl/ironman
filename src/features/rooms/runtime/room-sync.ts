import { resolveRoomPlaybackState } from "@shared/rooms-state";

import type {
  RoomDetails,
  RoomQueueItem,
  RoomSyncState,
} from "../client/room-types";

export interface ResolvedRoomPlayback {
  currentQueueItem: RoomQueueItem | null;
  currentQueueItemId: RoomQueueItem["_id"] | null;
  currentOffsetMs: number;
  paused: boolean;
  pausedAt: number | null;
  startedAt: number | null;
  startOffsetMs: number;
}

export function resolveRoomPlayback(
  roomDetails: RoomDetails | null,
  now: number,
): ResolvedRoomPlayback | null {
  if (!roomDetails) {
    return null;
  }

  if (
    roomDetails.playback.currentQueueItemId === null &&
    roomDetails.playback.currentQueueItem === null &&
    roomDetails.playback.startedAt === null
  ) {
    return {
      currentQueueItem: null,
      currentQueueItemId: null,
      currentOffsetMs: 0,
      paused: true,
      pausedAt: roomDetails.playback.pausedAt,
      startedAt: null,
      startOffsetMs: 0,
    };
  }

  const playbackQueue = roomDetails.playback.currentQueueItem
    ? [
        roomDetails.playback.currentQueueItem,
        ...roomDetails.queue.filter(
          (queueItem) => queueItem._id !== roomDetails.playback.currentQueueItemId,
        ),
      ]
    : roomDetails.queue;

  const resolvedPlayback = resolveRoomPlaybackState(
    playbackQueue.map((queueItem, index) => ({
      ...queueItem,
      position: index,
    })),
    {
      currentQueueItemId: roomDetails.playback.currentQueueItemId,
      startedAt: roomDetails.playback.startedAt,
      startOffsetMs: roomDetails.playback.startOffsetMs,
      paused: roomDetails.playback.paused,
      pausedAt: roomDetails.playback.pausedAt,
    },
    now,
  );

  return {
    ...resolvedPlayback,
    currentQueueItem:
      playbackQueue.find(
        (queueItem) => queueItem._id === resolvedPlayback.currentQueueItemId,
      ) ?? null,
  };
}

export function getRoomSyncState({
  hasActiveMembership,
  resolvedPlayback,
}: {
  hasActiveMembership: boolean;
  resolvedPlayback: ResolvedRoomPlayback | null;
}): RoomSyncState {
  if (!hasActiveMembership || !resolvedPlayback) {
    return {
      code: "idle",
      label: "Not listening to a room",
      driftMs: null,
    };
  }

  if (!resolvedPlayback.currentQueueItem) {
    return {
      code: "queue_empty",
      label: "Queue is empty",
      driftMs: null,
    };
  }

  if (resolvedPlayback.paused) {
    return {
      code: "paused",
      label: "Playback stopped",
      driftMs: null,
    };
  }

  return {
    code: "synced",
    label: "Following room",
    driftMs: null,
  };
}
