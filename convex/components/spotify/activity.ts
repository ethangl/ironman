import { v } from "convex/values";

import {
  getFavoriteArtists,
  getPlaylistTracks,
  getRecentlyPlayed,
  getTopArtists,
  getUserPlaylists,
} from "./activityApi";
import { action, type ActionCtx } from "./_generated/server";
import { getCachedValue, setCachedValue } from "./cacheHelpers";
import { SpotifyApiError } from "./errors";
import {
  spotifyActivitySnapshotValidator,
  spotifyArtistValidator,
  spotifyPlaylistsPageValidator,
  spotifyRecentlyPlayedResultValidator,
  spotifyPlaylistValidator,
  spotifyTrackValidator,
} from "./validators";

const RECENTLY_PLAYED_CACHE_TTL_MS = 30 * 1000;
const PLAYLISTS_PAGE_CACHE_TTL_MS = 5 * 60 * 1000;
const PLAYLIST_TRACKS_CACHE_TTL_MS = 10 * 60 * 1000;
const FAVORITE_ARTISTS_CACHE_TTL_MS = 15 * 60 * 1000;
const TOP_ARTISTS_CACHE_TTL_MS = 15 * 60 * 1000;

function resolveCacheScope(cacheScope?: string) {
  return cacheScope ?? "global";
}

type RecentlyPlayedItems = Awaited<ReturnType<typeof getRecentlyPlayed>>;
type RecentlyPlayedCacheValue = {
  items: RecentlyPlayedItems;
  rateLimited: boolean;
};
type PlaylistsPageCacheValue = Awaited<ReturnType<typeof getUserPlaylists>>;
type PlaylistTracksCacheValue = Awaited<ReturnType<typeof getPlaylistTracks>>;
type FavoriteArtistsCacheValue = Awaited<ReturnType<typeof getFavoriteArtists>>;
type TopArtistsCacheValue = Awaited<ReturnType<typeof getTopArtists>>;
type ActivitySnapshotCacheValue = {
  recentlyPlayed: RecentlyPlayedCacheValue;
  playlistsPage: PlaylistsPageCacheValue;
  favoriteArtists: FavoriteArtistsCacheValue;
};

function toActivityError(error: unknown, fallback: string) {
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

async function loadRecentlyPlayedResult(
  ctx: ActionCtx,
  args: {
    accessToken: string;
    limit?: number;
    cacheScope?: string;
  },
): Promise<RecentlyPlayedCacheValue> {
  const cacheKey = `recentlyPlayed:${resolveCacheScope(args.cacheScope)}:${args.limit ?? 50}`;
  const cached = await getCachedValue<RecentlyPlayedCacheValue>(ctx, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = {
      items: await getRecentlyPlayed(args.accessToken, args.limit ?? 50),
      rateLimited: false,
    };
    await setCachedValue(
      ctx,
      cacheKey,
      result,
      RECENTLY_PLAYED_CACHE_TTL_MS,
    );
    return result;
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 429) {
      return {
        items: [],
        rateLimited: true,
      };
    }

    throw toActivityError(
      error,
      "Could not load your recent tracks right now.",
    );
  }
}

async function loadPlaylistsPageResult(
  ctx: ActionCtx,
  args: {
    accessToken: string;
    limit?: number;
    offset?: number;
    cacheScope?: string;
  },
): Promise<PlaylistsPageCacheValue> {
  const cacheKey = `playlistsPage:${resolveCacheScope(args.cacheScope)}:${args.limit ?? 50}:${args.offset ?? 0}`;
  const cached = await getCachedValue<PlaylistsPageCacheValue>(ctx, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await getUserPlaylists(
      args.accessToken,
      args.limit ?? 50,
      args.offset ?? 0,
    );
    await setCachedValue(ctx, cacheKey, result, PLAYLISTS_PAGE_CACHE_TTL_MS);
    return result;
  } catch {
    return { items: [], total: 0 };
  }
}

async function loadFavoriteArtistsResult(
  ctx: ActionCtx,
  args: {
    accessToken: string;
    limit?: number;
    cacheScope?: string;
  },
): Promise<FavoriteArtistsCacheValue> {
  const cacheKey = `favoriteArtists:${resolveCacheScope(args.cacheScope)}:${args.limit ?? 50}`;
  const cached = await getCachedValue<FavoriteArtistsCacheValue>(ctx, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await getFavoriteArtists(args.accessToken, args.limit ?? 50);
    await setCachedValue(
      ctx,
      cacheKey,
      result,
      FAVORITE_ARTISTS_CACHE_TTL_MS,
    );
    return result;
  } catch {
    return [];
  }
}

export const recentlyPlayed = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (ctx, args) => loadRecentlyPlayedResult(ctx, args),
});

export const playlistsPage = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (ctx, args) => loadPlaylistsPageResult(ctx, args),
});

export const playlistTracks = action({
  args: {
    accessToken: v.string(),
    playlistId: v.string(),
    cacheScope: v.optional(v.string()),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const cacheKey = `playlistTracks:${resolveCacheScope(args.cacheScope)}:${args.playlistId}`;
    const cached = await getCachedValue<PlaylistTracksCacheValue>(ctx, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await getPlaylistTracks(args.accessToken, args.playlistId);
      await setCachedValue(
        ctx,
        cacheKey,
        result,
        PLAYLIST_TRACKS_CACHE_TTL_MS,
      );
      return result;
    } catch (error) {
      throw toActivityError(error, "Could not load playlist tracks.");
    }
  },
});

export const topArtists = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const cacheKey = `topArtists:${resolveCacheScope(args.cacheScope)}:${args.limit ?? 10}`;
    const cached = await getCachedValue<TopArtistsCacheValue>(ctx, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await getTopArtists(args.accessToken, args.limit ?? 10);
      await setCachedValue(ctx, cacheKey, result, TOP_ARTISTS_CACHE_TTL_MS);
      return result;
    } catch {
      return [];
    }
  },
});

export const favoriteArtists = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => loadFavoriteArtistsResult(ctx, args),
});

export const activitySnapshot = action({
  args: {
    accessToken: v.string(),
    cacheScope: v.optional(v.string()),
  },
  returns: spotifyActivitySnapshotValidator,
  handler: async (ctx, args) => {
    const [recentlyPlayed, playlistsPage, favoriteArtists] = await Promise.all([
      loadRecentlyPlayedResult(ctx, args),
      loadPlaylistsPageResult(ctx, args),
      loadFavoriteArtistsResult(ctx, args),
    ]);

    const result: ActivitySnapshotCacheValue = {
      recentlyPlayed,
      playlistsPage,
      favoriteArtists,
    };

    return result;
  },
});
