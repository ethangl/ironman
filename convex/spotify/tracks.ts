import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import { spotifyFetch } from "./client";
import { DAY_IN_MS, DEFAULT_LIMIT } from "./constants";
import { SpotifyApiError } from "./errors";
import { mapTrack, type SpotifyApiTrack } from "./mappers";
import type {
  SpotifyCursorPage,
  SpotifyRecentlyPlayedItem,
  SpotifyRecentlyPlayedPageResult,
} from "./types";
import { spotifyRecentlyPlayedPageResultValidator } from "./validators";

interface RecentlyPlayedResponse {
  cursors?: {
    after?: string | null;
    before?: string | null;
  };
  limit?: number;
  items?: {
    played_at: string;
    track: SpotifyApiTrack;
  }[];
  next?: string | null;
  total?: number;
}

const loadRecentlyPlayedRef = anyApi["spotify/tracks"]
  .loadRecentlyPlayed as FunctionReference<
  "action",
  "internal",
  {
    limit: number;
    before: number | null;
    cacheScope: string;
  },
  SpotifyRecentlyPlayedPageResult
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

function parseSpotifyNumberCursor(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getSpotifyNextCursor(
  next: string | null | undefined,
  key: string,
) {
  if (!next) {
    return null;
  }

  try {
    return parseSpotifyNumberCursor(new URL(next).searchParams.get(key));
  } catch {
    return null;
  }
}

function createSpotifyCursorPage<TItem>(
  response: RecentlyPlayedResponse | null | undefined,
  items: TItem[],
  limit = DEFAULT_LIMIT,
): SpotifyCursorPage<TItem, number> {
  const normalizedLimit = response?.limit ?? limit;
  const total = response?.total ?? items.length;
  const nextCursor =
    getSpotifyNextCursor(response?.next, "before") ??
    parseSpotifyNumberCursor(response?.cursors?.before);
  const hasMore = nextCursor !== null || Boolean(response?.next);

  return {
    items,
    limit: normalizedLimit,
    total,
    nextCursor,
    hasMore,
  };
}

function createEmptySpotifyCursorPage<TItem>(
  limit = DEFAULT_LIMIT,
): SpotifyCursorPage<TItem, number> {
  return {
    items: [],
    limit,
    total: 0,
    nextCursor: null,
    hasMore: false,
  };
}

export async function getRecentlyPlayedPage(
  token: string,
  limit = DEFAULT_LIMIT,
  before?: number | null,
): Promise<SpotifyCursorPage<SpotifyRecentlyPlayedItem, number>> {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  if (before !== null && before !== undefined) {
    params.set("before", String(before));
  }

  const data = await spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?${params.toString()}`,
    token,
  );

  const items = (data?.items ?? []).map((item) => ({
    playedAt: item.played_at,
    track: mapTrack(item.track),
  }));

  return createSpotifyCursorPage(data, items, limit);
}

export async function loadRecentlyPlayedResult(args: {
  accessToken: string;
  before?: number | null;
  limit?: number;
  cacheScope?: string;
}): Promise<SpotifyRecentlyPlayedPageResult> {
  const limit = args.limit ?? DEFAULT_LIMIT;
  const before = args.before ?? null;

  try {
    return {
      page: await getRecentlyPlayedPage(args.accessToken, limit, before),
      rateLimited: false,
    };
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 429) {
      return {
        page: createEmptySpotifyCursorPage(limit),
        rateLimited: true,
      };
    }

    throw toTracksError(error, "Could not load your recent tracks right now.");
  }
}

export const loadRecentlyPlayed = internalAction({
  args: {
    before: v.union(v.number(), v.null()),
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyRecentlyPlayedPageResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return loadRecentlyPlayedResult({
      accessToken,
      before: args.before,
      limit: args.limit,
      cacheScope: args.cacheScope,
    });
  },
});

export const spotifyRecentlyPlayedCache = new ActionCache(
  components.actionCache,
  {
    action: loadRecentlyPlayedRef,
    name: "spotify-recently-played-v2",
    ttl: DAY_IN_MS,
  },
);

export async function clearTracksCaches(ctx: ActionCtx) {
  await spotifyRecentlyPlayedCache.removeAllForName(ctx);
}
