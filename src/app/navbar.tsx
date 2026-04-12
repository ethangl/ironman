import { HomeIcon } from "lucide-react";

import { AppLink } from "@/components/app-link";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LoginButton } from "@/features/auth";
import { SearchInput, SearchProvider, SearchResults } from "@/features/search";
import { useAppAuth, useAppCapabilities } from "./app-runtime";
import { ClearSpotifyCacheButton } from "./clear-spotify-cache-button";

export function Navbar() {
  const { session, isAuthenticated } = useAppAuth();
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();

  if (isAuthenticated && session && canBrowsePersonalSpotify) {
    return (
      <SearchProvider>
        <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed inset-0 px-3 top-0 z-20">
          <div className="flex gap-2 h-16 items-center relative -z-1">
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={
                <AppLink href="/">
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
          </div>
          <SearchInput />
        </header>
        <SearchResults />
      </SearchProvider>
    );
  }

  if (isAuthenticated && session) {
    return (
      <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between px-4 top-0 z-20">
        <AppLink href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-foreground">
            ironman<span className="text-red-500">.fm</span>
          </span>
        </AppLink>
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

  return (
    <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between px-4 top-0 z-20">
      <AppLink href="/" className="flex items-center gap-2">
        <span className="text-xl font-black tracking-tighter text-foreground">
          ironman<span className="text-red-500">.fm</span>
        </span>
      </AppLink>
      <LoginButton />
    </header>
  );
}
