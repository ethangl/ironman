"use client";

import Link from "next/link";

import { useSession } from "@/lib/auth-client";
import { HomeIcon } from "lucide-react";
import { Avatar } from "./avatar";
import { LoginButton } from "./login-button";
import { SearchInput } from "./search/search-input";
import { SearchProvider } from "./search/search-provider";
import { SearchResults } from "./search/search-results";
import { Button } from "./ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  if (isLoggedIn) {
    return (
      <SearchProvider>
        <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between pl-2 pr-4 top-0 z-20">
          <SearchInput />
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={
              <Link href="/">
                <HomeIcon />
              </Link>
            }
          />
          <Link
            href="/profile"
            className="inline-flex gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <Avatar
              id={session.user.id}
              image={session.user.image || null}
              name={session.user.name}
              sizeClassName="size-8 text-xl"
            />
          </Link>
        </header>
        <SearchResults />
      </SearchProvider>
    );
  }

  return (
    <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between px-4 top-0 z-20">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-black tracking-tighter text-foreground">
          ironman<span className="text-red-500">.fm</span>
        </span>
      </Link>
      <LoginButton />
    </header>
  );
}
