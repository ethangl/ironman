import type { Track } from "@/features/spotify-client/types";
import type { RoomDetails, RoomQueueItem, RoomSyncState } from "./room-types";

export function toRoomTrack(queueItem: RoomQueueItem | null): Track | null {
  if (!queueItem) {
    return null;
  }

  return {
    id: queueItem.trackId,
    name: queueItem.trackName,
    artist: queueItem.trackArtists.join(", "),
    albumImage: queueItem.trackImageUrl,
    durationMs: queueItem.trackDurationMs,
  };
}

export function formatRoomTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRoomDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatRoomSyncLabel(syncState: RoomSyncState) {
  return syncState.label;
}

export function buildRoomActivityEntries(roomDetails: RoomDetails) {
  const entries = [
    {
      id: `room:${roomDetails.room._id}`,
      title: "Room opened",
      detail: roomDetails.room.name,
      at: roomDetails.room.createdAt,
    },
    ...(roomDetails.playback.currentQueueItem
        ? [
          {
            id: `playback:${roomDetails.playback.updatedAt}`,
            title: roomDetails.playback.paused
              ? "Playback stopped"
              : "Now playing",
            detail: roomDetails.playback.currentQueueItem.trackName,
            at: roomDetails.playback.updatedAt,
          },
        ]
      : []),
    ...roomDetails.queue.map((queueItem) => ({
      id: `queue:${queueItem._id}`,
      title: "Queued track",
      detail: queueItem.trackName,
      at: queueItem.addedAt,
    })),
  ];

  return entries.sort((left, right) => right.at - left.at).slice(0, 8);
}
