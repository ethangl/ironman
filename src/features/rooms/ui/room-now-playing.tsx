import { AlbumArt } from "@/components/album-art";
import { Button } from "@/components/ui/button";
import { MetronomeIcon, SkipForwardIcon } from "lucide-react";
import type { RoomDetails } from "../client/room-types";
import { formatRoomDuration, toRoomTrack } from "../client/room-utils";
import { ResolvedRoomPlayback } from "../runtime/room-sync";
import { useRooms } from "../runtime/rooms-provider";

export function RoomNowPlaying({
  resolvedPlayback,
  room,
}: {
  resolvedPlayback: ResolvedRoomPlayback | null;
  room: RoomDetails;
}) {
  const {
    activeRoomId,
    repairSync,
    selectActiveRoom,
    skipRoom,
  } = useRooms();

  const currentQueueItem = resolvedPlayback?.currentQueueItem ?? null;
  const currentTrack = toRoomTrack(currentQueueItem);
  const isActiveRoom = activeRoomId === room.room._id;
  const canControlPlayback = room.playback.canControlPlayback;

  return (
    <div className="flex gap-4 items-center rounded-2xl bg-white/5 p-4">
      <AlbumArt src={currentTrack?.albumImage || null} className="size-16" />
      <div className="flex-1 space-y-1">
        <h2 className="text-2xl font-semibold">
          {currentTrack?.name ?? "Queue is ready for its next track"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {currentTrack
            ? `${currentTrack.artist} • ${formatRoomDuration(
                resolvedPlayback?.currentOffsetMs ?? 0,
              )}`
            : "Use the search bar above to start filling this room."}
        </p>
      </div>
      {isActiveRoom ? (
        <Button variant="ghost" size="sm" onClick={repairSync}>
          <MetronomeIcon />
          Sync to room
        </Button>
      ) : (
        <Button onClick={() => selectActiveRoom(room.room._id)}>
          Listen live
        </Button>
      )}
      {canControlPlayback && currentQueueItem ? (
        <Button onClick={() => void skipRoom(room.room._id)}>
          <SkipForwardIcon />
          Skip
        </Button>
      ) : null}
    </div>
  );
}
