import { Leaderboard } from "@/components/leaderboard";
import { LoginButton } from "@/components/login-button";
import { SpotifyActivityProvider } from "@/components/spotify-activity-provider";
import { Separator } from "@/components/ui/separator";
import { BangersBoard } from "@/frontend/home/bangers-board";
import { BrutalityBoard } from "@/frontend/home/brutality-board";
import { FavoriteArtists } from "@/frontend/home/favorite-artists";
import { HomeHero } from "@/frontend/home/home-hero";
import { IronmenBoard } from "@/frontend/home/ironmen-board";
import { Playlists } from "@/frontend/home/playlists";
import { RecentTracks } from "@/frontend/home/recent-tracks";
import { useAppCapabilities } from "@/runtime/app-runtime";

export function HomeRoute() {
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();

  return (
    <main className="max-w-full space-y-12">
      {canBrowsePersonalSpotify ? (
        <SpotifyActivityProvider>
          <RecentTracks />
          <Playlists />
          <FavoriteArtists />
        </SpotifyActivityProvider>
      ) : (
        <HomeHero
          spotifyStatus={spotifyStatus}
          action={
            spotifyStatus.actionLabel ? <LoginButton align="start" /> : null
          }
        />
      )}
      <Separator />
      <div className="grid gap-8 space-y-12 lg:grid-cols-2">
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
