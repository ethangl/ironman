import { LibraryIcon, PanelLeftCloseIcon } from "lucide-react";

import { AppLink } from "@/components/app-link";
import { Avatar } from "@/components/avatar";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/features/auth";
import { SearchInput } from "@/features/search";
import { useAppAuth, useAppCapabilities } from "../../../app/app-runtime";
import { useSpotifyActivityUi } from "./use-spotify-activity-ui";

export function SpotifyNavbar() {
  const { session } = useAppAuth();
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();
  const { isExpanded, setIsExpanded } = useSpotifyActivityUi();

  if (!session) {
    return null;
  }

  if (canBrowsePersonalSpotify) {
    return (
      <Section className="flex flex-none gap-2 h-16 items-center pl-0 pr-4">
        <SearchInput />
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? <PanelLeftCloseIcon /> : <LibraryIcon />}
        </Button>
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
