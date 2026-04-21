import { HomeIcon, RadioTowerIcon } from "lucide-react";

import { AppLink } from "@/components/app-link";
import { Avatar } from "@/components/avatar";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LoginButton } from "@/features/auth";
import { useRooms } from "@/features/rooms";
import { useAppCapabilities, useAuthenticatedSession } from "@/app";
import { ClearSpotifyCacheButton } from "../../../app/clear-spotify-cache-button";
import { RoomLink } from "./room-link";

export function RoomsNavbar() {
  const session = useAuthenticatedSession();
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();
  const { activeRoom } = useRooms();

  if (canBrowsePersonalSpotify) {
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

  return (
    <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between px-4 top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="hidden max-w-xs text-right md:block">
          <p className="text-xs font-semibold text-foreground">
            {spotifyStatus.title}
          </p>
          <p className="text-[11px] leading-4 text-muted-foreground">
            {spotifyStatus.description}
          </p>
        </div>
        <ClearSpotifyCacheButton />
        {spotifyStatus.code === "checking" ? (
          <div
            aria-label="Checking Spotify connection"
            className="flex h-9 w-9 items-center justify-center"
          >
            <Spinner />
          </div>
        ) : null}
        {activeRoom ? (
          <RoomLink
            roomId={activeRoom.room._id}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/15"
          >
            <RadioTowerIcon className="size-3.5" />
            {activeRoom.room.name}
          </RoomLink>
        ) : null}
        <AppLink
          href="/profile"
          className="inline-flex gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <Avatar
            id={session.user.id}
            image={session.user.image || null}
            name={session.user.name}
            sizeClassName="size-8 text-xl"
          />
        </AppLink>
        {spotifyStatus.code === "reconnect_required" ? <LoginButton /> : null}
      </div>
    </header>
  );
}
