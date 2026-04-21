import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { useRooms } from "../runtime/rooms-provider";
import { RoomCard } from "./room-card";
import { RoomCreateForm } from "./room-create-form";

export function RoomsHome() {
  const { activeRoom, rooms, roomsLoading } = useRooms();
  const activeRoomId = activeRoom?.room._id ?? null;
  const joinedRooms = rooms.filter(
    (roomSummary) => !!roomSummary.viewerMembership,
  );
  const discoverRooms = rooms.filter(
    (roomSummary) => !roomSummary.viewerMembership,
  );

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
              You are not in any rooms yet. Join one below or start your own.
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
            <div className="grid gap-3 lg:grid-cols-2">
              {discoverRooms.map((roomSummary) => (
                <RoomCard
                  key={roomSummary.room._id}
                  roomSummary={roomSummary}
                  active={activeRoomId === roomSummary.room._id}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Every public room already has you in it, which is a pretty good
              problem to have.
            </p>
          )}
        </SectionContent>
      </Section>
      <RoomCreateForm />
    </>
  );
}
