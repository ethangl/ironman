import { LeaderboardList } from "@/components/leaderboard";
import { LoginButton } from "@/components/login-button";
import { SpotifyActivityProvider } from "@/components/spotify-activity-provider";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { BangersBoardList } from "@/frontend/home/bangers-board";
import { BrutalityBoardList } from "@/frontend/home/brutality-board";
import { FavoriteArtists } from "@/frontend/home/favorite-artists";
import { HomeHero } from "@/frontend/home/home-hero";
import { IronmenBoardList } from "@/frontend/home/ironmen-board";
import { Playlists } from "@/frontend/home/playlists";
import { RecentTracks } from "@/frontend/home/recent-tracks";
import { useHomeLeaderboardsData } from "@/hooks/use-home-leaderboards-data";
import { useAppCapabilities } from "@/runtime/app-runtime";

export function HomeRoute() {
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();
  const { data: homeBoards, loading: homeBoardsLoading } =
    useHomeLeaderboardsData();

  return (
    <>
      <main className="max-w-full space-y-12">
        {canBrowsePersonalSpotify ? (
          <SpotifyActivityProvider>
            <RecentTracks />
            <Playlists />
            <FavoriteArtists />
          </SpotifyActivityProvider>
        ) : spotifyStatus.code === "checking" ? (
          <section className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
            <Spinner className="h-8 w-8 border-[3px]" />
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight">
                Loading your Spotify view
              </h1>
              <p className="max-w-md text-sm text-muted-foreground">
                We’re confirming your session and Spotify connection before we
                show your personal listening data.
              </p>
            </div>
          </section>
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
            <BrutalityBoardList
              songs={homeBoards.hellscape}
              loading={homeBoardsLoading}
            />
            <Separator />
            <BangersBoardList
              songs={homeBoards.bangers}
              loading={homeBoardsLoading}
            />
            <Separator className="lg:hidden" />
          </div>
          <div className="space-y-12">
            <IronmenBoardList
              entries={homeBoards.ironmen}
              loading={homeBoardsLoading}
            />
            <Separator />
            <LeaderboardList
              entries={homeBoards.global}
              myEntry={null}
              loading={homeBoardsLoading}
            />
          </div>
        </div>
      </main>
    </>
  );
}
