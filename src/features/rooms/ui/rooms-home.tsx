import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { useRooms } from "../runtime/rooms-provider";
import { RoomCard } from "./room-card";

export function RoomsHome() {
  const { activeRoom, rooms, roomsLoading } = useRooms();
  const activeRoomId = activeRoom?.room._id ?? null;
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
          {roomsLoading ? (
            <p className="text-sm text-muted-foreground">Loading rooms...</p>
          ) : joinedRooms.length > 0 ? (
            <>
              {joinedRooms.map((roomSummary) => (
                <RoomCard
                  key={roomSummary.room._id}
                  roomSummary={roomSummary}
                  active={activeRoomId === roomSummary.room._id}
                />
              ))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              You do not have any room roles yet. Start one below or ask a room
              owner to grant you access.
            </p>
          )}
        </SectionContent>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Discover Rooms</SectionTitle>
        </SectionHeader>
        <SectionContent>
          {roomsLoading ? (
            <p className="text-sm text-muted-foreground">Loading rooms...</p>
          ) : discoverRooms.length > 0 ? (
            <>
              {discoverRooms.map((roomSummary) => (
                <RoomCard
                  key={roomSummary.room._id}
                  roomSummary={roomSummary}
                  active={activeRoomId === roomSummary.room._id}
                />
              ))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              There are no public rooms to discover right now.
            </p>
          )}
        </SectionContent>
      </Section>
    </>
  );
}
