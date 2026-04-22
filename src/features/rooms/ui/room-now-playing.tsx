import { AlbumArt } from "@/components/album-art";
import { Button } from "@/components/ui/button";
import { SkipForwardIcon } from "lucide-react";
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
  const { skipRoom } = useRooms();

  const currentQueueItem = resolvedPlayback?.currentQueueItem ?? null;
  const currentTrack = toRoomTrack(currentQueueItem);
  const canControlPlayback = room.playback.canControlPlayback;

  return (
    <div className="flex gap-4 items-center rounded-2xl bg-white/5 p-3">
      <AlbumArt src={currentTrack?.albumImage || null} className="size-20" />
      <div className="flex-1 min-w-0 space-y-1">
        <h2 className="text-3xl truncate">
          {currentTrack?.name ?? "Queue is empty"}
        </h2>
        {currentTrack && (
          <p className="text-lg text-muted-foreground">
            {currentTrack.artist} •{" "}
            {formatRoomDuration(resolvedPlayback?.currentOffsetMs ?? 0)}
          </p>
        )}
      </div>

      {canControlPlayback && currentQueueItem && (
        <Button
          variant="ghost"
          size="icon-xl"
          onClick={() => void skipRoom(room.room._id)}
        >
          <SkipForwardIcon />
        </Button>
      )}
    </div>
  );
}
