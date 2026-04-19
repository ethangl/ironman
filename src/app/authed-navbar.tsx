import { HomeIcon } from "lucide-react";

import { AppLink } from "@/components/app-link";
import { Avatar } from "@/components/avatar";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LoginButton } from "@/features/auth";
import { SearchInput } from "@/features/search";
import { useAppAuth, useAppCapabilities } from "./app-runtime";
import { ClearSpotifyCacheButton } from "./clear-spotify-cache-button";

export function AuthedNavbar() {
  const { session } = useAppAuth();
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();

  if (!session) {
    return null;
  }

  if (canBrowsePersonalSpotify) {
    return (
      <Section color="--color-emerald-400" className="m-3">
        <div className="flex gap-2 items-center mix-blend-exclusion p-4 relative">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={
              <AppLink href="/home">
                <HomeIcon />
              </AppLink>
            }
            className="mr-auto"
          />
          <ClearSpotifyCacheButton />
          <AppLink
            href="/profile"
            className="inline-flex gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <Avatar
              id={session.user.id}
              image={session.user.image || null}
              name={session.user.name}
              sizeClassName="size-8 text-xl"
            />
          </AppLink>
          <SearchInput />
        </div>
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
