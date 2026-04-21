import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import { mapTrack, type SpotifyApiTrack } from "./mappers";
import type { SpotifyRecentlyPlayedItem, SpotifyRecentlyPlayedResult } from "./types";
import { spotifyRecentlyPlayedResultValidator } from "./validators";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const RECENTLY_PLAYED_DEFAULT_LIMIT = 30;

interface RecentlyPlayedResponse {
  items?: {
    played_at: string;
    track: SpotifyApiTrack;
  }[];
}

const loadRecentlyPlayedRef =
  anyApi["spotify/tracks"].loadRecentlyPlayed as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyRecentlyPlayedResult
  >;

function toTracksError(error: unknown, fallback: string) {
  if (!(error instanceof SpotifyApiError)) {
    return new Error(fallback);
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Reconnect Spotify to load your listening activity.");
  }

  if (error.status === 429) {
    return new Error("Spotify is rate limiting activity requests right now.");
  }

  return new Error(fallback);
}

export async function getRecentlyPlayed(
  token: string,
  limit = RECENTLY_PLAYED_DEFAULT_LIMIT,
): Promise<SpotifyRecentlyPlayedItem[]> {
  const data = await spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}`,
    token,
  );
  if (!data?.items) {
    return [];
  }

  return data.items.map((item) => ({
    playedAt: item.played_at,
    track: mapTrack(item.track),
  }));
}

export async function loadRecentlyPlayedResult(args: {
  accessToken: string;
  limit?: number;
  cacheScope?: string;
}): Promise<SpotifyRecentlyPlayedResult> {
  const limit = args.limit ?? RECENTLY_PLAYED_DEFAULT_LIMIT;

  try {
    return {
      items: await getRecentlyPlayed(args.accessToken, limit),
      rateLimited: false,
    };
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 429) {
      return {
        items: [],
        rateLimited: true,
      };
    }

    throw toTracksError(error, "Could not load your recent tracks right now.");
  }
}

export const loadRecentlyPlayed = internalAction({
  args: {
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return loadRecentlyPlayedResult({
      accessToken,
      limit: args.limit,
      cacheScope: args.cacheScope,
    });
  },
});

export const spotifyRecentlyPlayedCache = new ActionCache(
  components.actionCache,
  {
    action: loadRecentlyPlayedRef,
    name: "spotify-recently-played-v1",
    ttl: DAY_IN_MS,
  },
);

export async function clearTracksCaches(ctx: ActionCtx) {
  await spotifyRecentlyPlayedCache.removeAllForName(ctx);
}
