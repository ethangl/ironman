import { MainContent } from "@/components/main";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Spinner } from "@/components/ui/spinner";
import { useRoomDetails, type RoomId } from "@/features/rooms";
import { RoomActivityFeed } from "./room-activity-feed";
import { RoomPeople } from "./room-people";
import { RoomQueue } from "./room-queue";

export function Room({ roomId }: { roomId: RoomId }) {
  const roomQuery = useRoomDetails(roomId);

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
    data: { roleHolders, room },
    resolvedPlayback,
  } = roomQuery;

  return (
    <MainContent>
      <Section>
        <SectionHeader>
          <SectionTitle className="items-start">
            {room.name}
            <RoomPeople people={roleHolders} />
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
