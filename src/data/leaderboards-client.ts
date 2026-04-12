import { ConvexHttpClient } from "convex/browser";

import {
  type BangerSong,
  type HellscapeSong,
  type HomeLeaderboardsResponse,
  type IronmenEntry,
  type LeaderboardEntry,
  type TrackLeaderboardResponse,
} from "@shared/leaderboards";
import { api } from "@api";
import { getConvexUrl } from "@/lib/convex-env";

export interface LeaderboardsClient {
  getGlobal: () => Promise<LeaderboardEntry[]>;
  getHome: () => Promise<HomeLeaderboardsResponse>;
  getTrack: (
    trackId: string,
    currentUserId?: string | null,
  ) => Promise<TrackLeaderboardResponse>;
  getIronmen: () => Promise<IronmenEntry[]>;
  getBangers: () => Promise<BangerSong[]>;
  getBrutality: () => Promise<HellscapeSong[]>;
}

let cachedLeaderboardsClient: LeaderboardsClient | null = null;
let cachedLeaderboardsUrl: string | null = null;

function getDefaultConvexLeaderboardsClient() {
  const convexUrl = getConvexUrl("Convex leaderboard access");

  if (!cachedLeaderboardsClient || cachedLeaderboardsUrl !== convexUrl) {
    cachedLeaderboardsClient = createConvexLeaderboardsClient(convexUrl);
    cachedLeaderboardsUrl = convexUrl;
  }

  return cachedLeaderboardsClient;
}

export const convexLeaderboardsClient: LeaderboardsClient = {
  getGlobal: () => getDefaultConvexLeaderboardsClient().getGlobal(),
  getHome: () => getDefaultConvexLeaderboardsClient().getHome(),
  getTrack: (trackId, currentUserId) =>
    getDefaultConvexLeaderboardsClient().getTrack(trackId, currentUserId),
  getIronmen: () => getDefaultConvexLeaderboardsClient().getIronmen(),
  getBangers: () => getDefaultConvexLeaderboardsClient().getBangers(),
  getBrutality: () => getDefaultConvexLeaderboardsClient().getBrutality(),
};

export function createConvexLeaderboardsClient(
  convexUrl: string,
): LeaderboardsClient {
  const convex = new ConvexHttpClient(convexUrl);

  return {
    getGlobal: () => convex.query(api.leaderboards.global, {}),
    getHome: () => convex.query(api.leaderboards.home, {}),
    getTrack: (trackId, currentUserId) =>
      convex.query(api.leaderboards.track, {
        trackId,
        currentUserId: currentUserId ?? undefined,
      }),
    getIronmen: () => convex.query(api.leaderboards.ironmen, {}),
    getBangers: () => convex.query(api.leaderboards.bangers, {}),
    getBrutality: () => convex.query(api.leaderboards.hellscape, {}),
  };
}
