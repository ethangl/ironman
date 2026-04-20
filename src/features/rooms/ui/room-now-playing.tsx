import { AlbumArt } from "@/components/album-art";
import { Button } from "@/components/ui/button";
import { MetronomeIcon, PauseIcon, PlayIcon } from "lucide-react";
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
    playRoom,
    pauseRoom,
    repairSync,
    resumeRoom,
    selectActiveRoom,
  } = useRooms();

  const currentQueueItem = resolvedPlayback?.currentQueueItem ?? null;
  const currentTrack = toRoomTrack(currentQueueItem);
  const isActiveRoom = activeRoomId === room.room._id;

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
        <Button variant="ghost" size="icon-sm" onClick={repairSync}>
          <MetronomeIcon />
        </Button>
      ) : (
        <Button onClick={() => selectActiveRoom(room.room._id)}>
          Listen here
        </Button>
      )}
      <Button
        onClick={() =>
          currentQueueItem
            ? resolvedPlayback?.paused
              ? void resumeRoom(room.room._id)
              : void pauseRoom(room.room._id)
            : void playRoom(room.room._id)
        }
      >
        {!currentQueueItem || resolvedPlayback?.paused ? (
          <PlayIcon />
        ) : (
          <PauseIcon />
        )}
      </Button>
    </div>
  );
}
