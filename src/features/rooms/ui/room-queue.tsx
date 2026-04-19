import { useAppAuth } from "@/app";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import type { RoomDetails } from "../client/room-types";
import { ResolvedRoomPlayback } from "../runtime/room-sync";
import { useRooms } from "../runtime/rooms-provider";
import { RoomQueueList } from "./room-queue-list";

export function RoomQueue({
  room,
  resolvedPlayback,
}: {
  room: RoomDetails;
  resolvedPlayback: ResolvedRoomPlayback | null;
}) {
  const { session } = useAppAuth();
  const { moveQueueItem, removeQueueItem } = useRooms();

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          Queue
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {room.queueLength} queued
          </span>
        </SectionTitle>
      </SectionHeader>
      <SectionContent>
        <RoomQueueList
          roomId={room.room._id}
          queue={room.queue}
          currentQueueItemId={resolvedPlayback?.currentQueueItemId ?? null}
          canManageQueue={room.playback.canManageQueue}
          canRemoveQueueItem={(queueItem) =>
            room.playback.canManageQueue ||
            queueItem.addedByUserId === session?.user.id
          }
          onMove={(nextRoomId, queueItemId, targetIndex) =>
            void moveQueueItem(nextRoomId, queueItemId, targetIndex)
          }
          onRemove={(nextRoomId, queueItemId) =>
            void removeQueueItem(nextRoomId, queueItemId)
          }
        />
      </SectionContent>
    </Section>
  );
}
