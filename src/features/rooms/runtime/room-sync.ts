import { resolveRoomPlaybackState } from "@shared/rooms-state";

import type { RoomDetails, RoomQueueItem, RoomSyncState } from "../client/room-types";

export interface ResolvedRoomPlayback {
  currentQueueItem: RoomQueueItem | null;
  currentQueueItemId: string | null;
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

  const resolvedPlayback = resolveRoomPlaybackState(
    roomDetails.queue,
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
      roomDetails.queue.find(
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
      label: "Room paused",
      driftMs: null,
    };
  }

  return {
    code: "synced",
    label: "Following room",
    driftMs: null,
  };
}
