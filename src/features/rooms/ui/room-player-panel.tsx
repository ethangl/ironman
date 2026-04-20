import { SkipForwardIcon } from "lucide-react";

import { useAppAuth } from "@/app";
import { AppLink } from "@/components/app-link";
import { Button } from "@/components/ui/button";
import { formatRoomSyncLabel } from "../client/room-utils";
import { useRooms } from "../runtime/rooms-provider";
import { RoomQueueList } from "./room-queue-list";
import { RoomStatusBadge } from "./room-status-badge";

export function RoomPlayerPanel() {
  const {
    activeRoom,
    leaveRoom,
    moveQueueItem,
    removeQueueItem,
    repairSync,
    resolvedPlayback,
    skipRoom,
    syncState,
  } = useRooms();
  const { session } = useAppAuth();

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
          <AppLink
            href={`/rooms/${activeRoom.room._id}`}
            className="truncate text-base font-semibold"
          >
            {activeRoom.room.name}
          </AppLink>
        </div>
        <RoomStatusBadge
          syncState={syncState}
          label={formatRoomSyncLabel(syncState)}
        />
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void leaveRoom(activeRoom.room._id)}
        >
          Leave room
        </Button>
      </div>

      <div className="mt-4">
        <RoomQueueList
          roomId={activeRoom.room._id}
          queue={activeRoom.queue}
          compact={true}
          limit={4}
          currentQueueItemId={resolvedPlayback?.currentQueueItemId ?? null}
          canManageQueue={activeRoom.playback.canManageQueue}
          canRemoveQueueItem={(queueItem) =>
            activeRoom.playback.canManageQueue ||
            queueItem.addedByUserId === session?.user.id
          }
          onMove={(roomId, queueItemId, targetIndex) =>
            void moveQueueItem(roomId, queueItemId, targetIndex)
          }
          onRemove={(roomId, queueItemId) =>
            void removeQueueItem(roomId, queueItemId)
          }
        />
      </div>
    </section>
  );
}
