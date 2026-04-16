import { useAppCapabilities } from "@/app";
import { Spinner } from "@/components/ui/spinner";
import { LoginButton } from "@/features/auth";
import {
  BangersBoardList,
  BrutalityBoardList,
  HomeHero,
  IronmenBoardList,
  useHomeLeaderboardsData,
} from "@/features/home";
import { LeaderboardList } from "@/features/leaderboards";
import {
  FavoriteArtists,
  Playlists,
  RecentTracks,
  SpotifyActivityProvider,
} from "@/features/spotify/activity";

export function HomeRoute() {
  const { canBrowsePersonalSpotify, spotifyStatus } = useAppCapabilities();
  const { data: homeBoards, loading: homeBoardsLoading } =
    useHomeLeaderboardsData();

  return (
    <>
      {canBrowsePersonalSpotify ? (
        <SpotifyActivityProvider>
          <div className="space-y-3">
            <RecentTracks />
            <Playlists />
            <FavoriteArtists />
          </div>
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
      <main className="max-w-full px-3 py-0">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <BrutalityBoardList
              songs={homeBoards.hellscape}
              loading={homeBoardsLoading}
            />
            <BangersBoardList
              songs={homeBoards.bangers}
              loading={homeBoardsLoading}
            />
          </div>
          <div className="flex flex-col gap-3">
            <IronmenBoardList
              entries={homeBoards.ironmen}
              loading={homeBoardsLoading}
            />
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
