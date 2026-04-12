import type { HomeLeaderboardsResponse } from "@shared/leaderboards";
import { api } from "@api";
import { useStableQuery } from "@/hooks/use-stable-query";

const EMPTY_HOME_LEADERBOARDS: HomeLeaderboardsResponse = {
  global: [],
  ironmen: [],
  bangers: [],
  hellscape: [],
};

export function useHomeLeaderboardsData() {
  const data = useStableQuery(api.leaderboards.home);

  return {
    data: data ?? EMPTY_HOME_LEADERBOARDS,
    loading: data === undefined,
  };
}
