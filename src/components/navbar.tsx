import { HomeIcon } from "lucide-react";
import { useAppAuth, useAppCapabilities } from "@/runtime/app-runtime";
import { AppLink } from "./app-link";
import { Avatar } from "./avatar";
import { LoginButton } from "./login-button";
import { SearchInput } from "./search/search-input";
import { SearchProvider } from "./search/search-provider";
import { SearchResults } from "./search/search-results";
import { Button } from "./ui/button";

export function Navbar() {
  const { session, isAuthenticated } = useAppAuth();
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();

  if (isAuthenticated && session && canBrowsePersonalSpotify) {
    return (
      <SearchProvider>
        <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between pl-2 pr-4 top-0 z-20">
          <SearchInput />
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={
              <AppLink href="/">
                <HomeIcon />
              </AppLink>
            }
          />
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
          <LoginButton />
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
