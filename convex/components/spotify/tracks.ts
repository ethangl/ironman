import { v } from "convex/values";

import { action } from "./_generated/server";
import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import { mapTrack, type SpotifyApiTrack } from "./mappers";
import type { SpotifyRecentlyPlayedItem, SpotifyRecentlyPlayedResult } from "./types";
import { spotifyRecentlyPlayedResultValidator } from "./validators";

const RECENTLY_PLAYED_LIMIT = 30;

interface RecentlyPlayedResponse {
  items?: {
    played_at: string;
    track: SpotifyApiTrack;
  }[];
}

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
  limit = RECENTLY_PLAYED_LIMIT,
): Promise<SpotifyRecentlyPlayedItem[]> {
  const data = await spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}`,
    token,
  );
  if (!data?.items) return [];

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
  const limit = args.limit ?? RECENTLY_PLAYED_LIMIT;

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

export const recentlyPlayed = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (_ctx, args) => loadRecentlyPlayedResult(args),
});
