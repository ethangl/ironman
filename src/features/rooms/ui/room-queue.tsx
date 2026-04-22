import { useAuthenticatedSession } from "@/app/require-authenticated-session";
import { SectionContent } from "@/components/section";
import type { RoomDetails } from "../client/room-types";
import { ResolvedRoomPlayback } from "../runtime/room-sync";
import { useRooms } from "../runtime/rooms-provider";
import { RoomNowPlaying } from "./room-now-playing";
import { RoomQueueList } from "./room-queue-list";

export function RoomQueue({
  room,
  resolvedPlayback,
}: {
  room: RoomDetails;
  resolvedPlayback: ResolvedRoomPlayback | null;
}) {
  const session = useAuthenticatedSession();
  const { moveQueueItem, removeQueueItem } = useRooms();

  const canManageOwnQueueItems = !!room.viewerMembership;

  return (
    <SectionContent className="space-y-1">
      <RoomNowPlaying resolvedPlayback={resolvedPlayback} room={room} />
      <div className="bg-section-color/10 h-0.5 -mx-3 my-2 rounded-full" />
      <RoomQueueList
        roomId={room.room._id}
        queue={room.queue}
        currentQueueItemId={resolvedPlayback?.currentQueueItemId ?? null}
        canManageQueue={room.playback.canManageQueue}
        canRemoveQueueItem={(queueItem) =>
          canManageOwnQueueItems &&
          (room.playback.canManageQueue ||
            queueItem.addedByUserId === session.user.id)
        }
        onMove={(nextRoomId, queueItemId, targetIndex) =>
          void moveQueueItem(nextRoomId, queueItemId, targetIndex)
        }
        onRemove={(nextRoomId, queueItemId) =>
          void removeQueueItem(nextRoomId, queueItemId)
        }
      />
    </SectionContent>
  );
}
