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
    <div className="bg-section-color/5 flex gap-4 items-center -mx-3 pr-3 rounded-2xl">
      <AlbumArt src={currentTrack?.albumImage || null} className="size-24" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <h2 className="flex gap-3 items-center justify-between leading-tight text-3xl">
          <span className="flex-1 min-w-0 truncate">
            {currentTrack?.name ?? "Queue is empty"}
          </span>
          {canControlPlayback && currentQueueItem && (
            <Button size="icon" onClick={() => void skipRoom(room.room._id)}>
              <SkipForwardIcon />
            </Button>
          )}
        </h2>
        {currentTrack && (
          <p className="leading-none text-xl text-muted-foreground">
            {currentTrack.artist} •{" "}
            {formatRoomDuration(resolvedPlayback?.currentOffsetMs ?? 0)}
          </p>
        )}
      </div>
    </div>
  );
}
