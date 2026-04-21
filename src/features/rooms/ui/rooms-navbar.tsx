import { HomeIcon, RadioTowerIcon } from "lucide-react";

import { useAuthenticatedSession } from "@/app/require-authenticated-session";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { useRooms } from "@/features/rooms";
import { RoomLink } from "./room-link";

export function RoomsNavbar() {
  useAuthenticatedSession();
  const { activeRoom } = useRooms();

  return (
    <Section className="flex flex-none gap-2 h-16 items-center p-4">
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={
          <RoomLink roomId={null}>
            <HomeIcon />
          </RoomLink>
        }
        className="mr-auto"
      />
      {activeRoom && (
        <RoomLink
          roomId={activeRoom.room._id}
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/15"
        >
          <RadioTowerIcon className="size-3.5" />
          {activeRoom.room.name}
        </RoomLink>
      )}
    </Section>
  );
}
