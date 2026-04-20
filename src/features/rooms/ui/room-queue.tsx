import { HeartCrackIcon, HeartIcon, Trash2Icon } from "lucide-react";

import { useAppAuth } from "@/app";
import { MoreMenu } from "@/components/more-menu";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { RoomDetails, RoomQueueItemId } from "../client/room-types";
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
  const { session } = useAppAuth();
  const { clearQueue, joinRoom, leaveRoom, moveQueueItem, removeQueueItem } =
    useRooms();
  const canControlPlayback = room.playback.canControlPlayback;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          {room.room.name}
          <nav className="flex gap-2 items-center">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {room.memberCount} listening
            </span>
            {room.viewerMembership ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => void leaveRoom(room.room._id)}
              >
                <HeartIcon />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => void joinRoom(room.room._id)}
              >
                <HeartCrackIcon />
              </Button>
            )}
            {canControlPlayback && (
              <MoreMenu>
                <DropdownMenuItem
                  onClick={() => void clearQueue(room.room._id)}
                >
                  <Trash2Icon /> Clear Queue
                </DropdownMenuItem>
              </MoreMenu>
            )}
          </nav>
        </SectionTitle>
        {room.room.description && (
          <SectionDescription>{room.room.description}</SectionDescription>
        )}
      </SectionHeader>
      <SectionContent className="space-y-2">
        <RoomNowPlaying resolvedPlayback={resolvedPlayback} room={room} />
        <RoomQueueList
          roomId={room.room._id}
          queue={room.queue}
          currentQueueItemId={
            (resolvedPlayback?.currentQueueItemId as RoomQueueItemId) ?? null
          }
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
