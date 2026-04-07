"use client";

import { Leaderboard } from "@/components/leaderboard";
import { SearchInput } from "@/components/search/search-input";
import { SearchProvider } from "@/components/search/search-provider";
import { SearchResults } from "@/components/search/search-results";
import { SpotifyActivityProvider } from "@/components/spotify-activity-provider";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/auth-client";
import { BangersBoard } from "./bangers-board";
import { BrutalityBoard } from "./brutality-board";
import { HomeHero } from "./home-hero";
import { IronmenBoard } from "./ironmen-board";
import { Playlists } from "./playlists";
import { RecentTracks } from "./recent-tracks";

export default function HomePage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <main className="max-w-full space-y-12">
      {isLoggedIn ? (
        <>
          <SearchProvider>
            <SearchInput />
            <SearchResults />
          </SearchProvider>
          <SpotifyActivityProvider>
            <RecentTracks />
            <Playlists />
          </SpotifyActivityProvider>
        </>
      ) : (
        <HomeHero />
      )}
      <Separator />
      <div className="gap-8 grid lg:grid-cols-2 space-y-12">
        <div className="space-y-12">
          <BrutalityBoard />
          <Separator />
          <BangersBoard />
          <Separator className="lg:hidden" />
        </div>
        <div className="space-y-12">
          <IronmenBoard />
          <Separator />
          <Leaderboard />
        </div>
      </div>
    </main>
  );
}
