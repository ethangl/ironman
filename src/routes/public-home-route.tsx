import { useAppCapabilities } from "@/app";
import { LoginButton } from "@/features/auth";
import {
  BangersBoardList,
  BrutalityBoardList,
  HomeHero,
  IronmenBoardList,
  useHomeLeaderboardsData,
} from "@/features/home";
import { LeaderboardList } from "@/features/leaderboards";

export function PublicHomeRoute() {
  const { spotifyStatus } = useAppCapabilities();
  const { data: homeBoards, loading: homeBoardsLoading } =
    useHomeLeaderboardsData();

  return (
    <>
      <HomeHero
        spotifyStatus={spotifyStatus}
        action={spotifyStatus.actionLabel ? <LoginButton align="start" /> : null}
      />
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
