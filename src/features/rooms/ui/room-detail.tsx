import { MetronomeIcon, Trash2Icon } from "lucide-react";

import { MainContent } from "@/components/main";
import { MoreMenu } from "@/components/more-menu";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useRoomDetails, useRooms, type RoomId } from "@/features/rooms";
import { FollowRoomButton } from "./follow-room-button";
import { RoomActivityFeed } from "./room-activity-feed";
import { RoomPeople } from "./room-people";
import { RoomQueue } from "./room-queue";

export function RoomDetail({ roomId }: { roomId: RoomId }) {
  const roomQuery = useRoomDetails(roomId);
  const { clearQueue, repairSync } = useRooms();

  if (roomQuery.loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (roomQuery.notFound || !roomQuery.data) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        That room could not be found.
      </div>
    );
  }

  const {
    data,
    data: { roleHolders, room, viewerMembership },
    resolvedPlayback,
  } = roomQuery;

  const canControlPlayback = data.playback.canControlPlayback;

  return (
    <MainContent>
      <Section>
        <SectionHeader>
          <SectionTitle className="items-start">
            {room.name}
            <nav className="flex gap-2 items-center">
              <RoomPeople people={roleHolders} />
              <Button variant="overlay" size="icon-sm" onClick={repairSync}>
                <MetronomeIcon />
              </Button>
              {!viewerMembership && <FollowRoomButton room={data} />}
              {canControlPlayback && (
                <MoreMenu>
                  <DropdownMenuItem onClick={() => void clearQueue(room._id)}>
                    <Trash2Icon /> Clear Queue
                  </DropdownMenuItem>
                </MoreMenu>
              )}
            </nav>
          </SectionTitle>
          {room.description && (
            <SectionDescription>{room.description}</SectionDescription>
          )}
        </SectionHeader>
        <RoomQueue resolvedPlayback={resolvedPlayback} room={data} />
        <RoomActivityFeed room={data} />
      </Section>
    </MainContent>
  );
}
