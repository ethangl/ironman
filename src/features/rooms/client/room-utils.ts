import type { Track } from "@/features/spotify-client/types";
import type { RoomQueueItem, RoomSyncState } from "./room-types";

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

export function formatRoomDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatRoomSyncLabel(syncState: RoomSyncState) {
  return syncState.label;
}
