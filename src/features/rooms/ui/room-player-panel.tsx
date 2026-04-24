import { SkipForwardIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRooms } from "../runtime/rooms-provider";
import { RoomLink } from "./room-link";
import { RoomQueue } from "./room-queue";

export function RoomPlayerPanel() {
  const {
    activeRoom,
    closeRoom,
    repairSync,
    resolvedPlayback,
    skipRoom,
  } = useRooms();

  if (!activeRoom) {
    return null;
  }

  const canControlPlayback = activeRoom.playback.canControlPlayback;
  const currentQueueItem = resolvedPlayback?.currentQueueItem ?? null;

  return (
    <section className="mt-5 rounded-[2rem] bg-white/5 p-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Listening Room
          </p>
          <RoomLink
            roomId={activeRoom.room._id}
            className="truncate text-base font-semibold"
          >
            {activeRoom.room.name}
          </RoomLink>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {canControlPlayback ? (
          currentQueueItem ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void skipRoom(activeRoom.room._id)}
            >
              <SkipForwardIcon />
              Skip
            </Button>
          ) : null
        ) : (
          <p className="text-xs text-muted-foreground">
            Only the room owner or a moderator can steer the room stream.
          </p>
        )}
        <Button variant="ghost" size="sm" onClick={repairSync}>
          Sync to room
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void closeRoom()}>
          Stop listening
        </Button>
      </div>

      <div className="mt-4">
        <RoomQueue
          room={activeRoom}
          resolvedPlayback={resolvedPlayback}
          limit={4}
        />
      </div>
    </section>
  );
}
