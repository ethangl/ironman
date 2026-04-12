import {
  type LeaderboardEntry,
  type TrackLeaderboardResponse,
} from "@shared/leaderboards";
import { api } from "@api";
import { useAppAuth } from "@/app";
import { useStableQuery } from "@/hooks/use-stable-query";

export function useLeaderboardData(trackId?: string) {
  const { session } = useAppAuth();
  const globalEntries = useStableQuery(
    api.leaderboards.global,
    trackId ? "skip" : {},
  );
  const trackLeaderboard = useStableQuery(
    api.leaderboards.track,
    trackId
      ? {
          trackId,
          currentUserId: session?.user.id ?? undefined,
        }
      : "skip",
  );

  if (!trackId) {
    return {
      entries: (globalEntries as LeaderboardEntry[] | undefined) ?? [],
      myEntry: null,
      loading: globalEntries === undefined,
    };
  }

  const data = trackLeaderboard as TrackLeaderboardResponse | undefined;

  return {
    entries: data?.leaderboard ?? [],
    myEntry: data?.myEntry ?? null,
    loading: data === undefined,
  };
}
