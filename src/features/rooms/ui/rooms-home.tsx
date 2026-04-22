import { List } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { useRooms } from "../runtime/rooms-provider";
import { RoomCard } from "./room-card";

export function RoomsHome() {
  const { rooms, roomsLoading } = useRooms();

  const joinedRooms = rooms.filter(
    (roomSummary) => !!roomSummary.viewerMembership,
  );

  const discoverRooms = [...rooms]
    .filter((roomSummary) => !roomSummary.viewerMembership)
    .sort((left, right) => {
      if (left.viewerFollowsRoom !== right.viewerFollowsRoom) {
        return left.viewerFollowsRoom ? -1 : 1;
      }

      return left.room.name.localeCompare(right.room.name);
    });

  return (
    <>
      <Section>
        <SectionHeader>
          <SectionTitle>Your Rooms</SectionTitle>
        </SectionHeader>
        <SectionContent className="space-y-2">
          <List count={joinedRooms.length} loading={roomsLoading}>
            {joinedRooms.map((roomSummary) => (
              <RoomCard key={roomSummary.room._id} roomSummary={roomSummary} />
            ))}
          </List>
        </SectionContent>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Discover Rooms</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <List count={discoverRooms.length} loading={roomsLoading}>
            {discoverRooms.map((roomSummary) => (
              <RoomCard key={roomSummary.room._id} roomSummary={roomSummary} />
            ))}
          </List>
        </SectionContent>
      </Section>
    </>
  );
}
