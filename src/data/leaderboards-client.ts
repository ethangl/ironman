import { ConvexHttpClient } from "convex/browser";

import {
  type BangerSong,
  type HellscapeSong,
  type IronmenEntry,
  type LeaderboardEntry,
  type TrackLeaderboardResponse,
} from "@/data/leaderboards";
import { api } from "../../convex/_generated/api";

export interface LeaderboardsClient {
  getGlobal: () => Promise<LeaderboardEntry[]>;
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

function getConvexLeaderboardsUrl() {
  const url =
    typeof window === "undefined"
      ? process.env.CONVEX_URL
      : import.meta.env.CONVEX_URL;

  if (!url) {
    throw new Error("Missing CONVEX_URL for Convex leaderboard access.");
  }

  return url;
}

function getDefaultConvexLeaderboardsClient() {
  const convexUrl = getConvexLeaderboardsUrl();

  if (!cachedLeaderboardsClient || cachedLeaderboardsUrl !== convexUrl) {
    cachedLeaderboardsClient = createConvexLeaderboardsClient(convexUrl);
    cachedLeaderboardsUrl = convexUrl;
  }

  return cachedLeaderboardsClient;
}

export const convexLeaderboardsClient: LeaderboardsClient = {
  getGlobal: () => getDefaultConvexLeaderboardsClient().getGlobal(),
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
