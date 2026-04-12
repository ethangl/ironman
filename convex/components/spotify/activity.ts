import { v } from "convex/values";

import {
  getFavoriteArtists,
  getPlaylistTracks,
  getRecentlyPlayed,
  getTopArtists,
  getUserPlaylists,
} from "./activityApi";
import { action } from "./_generated/server";
import { getCachedValue, setCachedValue } from "./cacheHelpers";
import { SpotifyApiError } from "./errors";
import {
  spotifyArtistValidator,
  spotifyPlaylistValidator,
  spotifyTrackValidator,
} from "./validators";

const recentlyPlayedItemValidator = v.object({
  playedAt: v.string(),
  track: spotifyTrackValidator,
});

const recentlyPlayedResultValidator = v.object({
  items: v.array(recentlyPlayedItemValidator),
  rateLimited: v.boolean(),
});

const playlistsPageValidator = v.object({
  items: v.array(spotifyPlaylistValidator),
  total: v.number(),
});

const activityBootstrapValidator = v.object({
  favoriteArtists: v.array(spotifyArtistValidator),
  playlists: v.array(spotifyPlaylistValidator),
  playlistsTotal: v.number(),
  recentTracks: v.array(recentlyPlayedItemValidator),
});

const RECENTLY_PLAYED_CACHE_TTL_MS = 30 * 1000;
const PLAYLISTS_PAGE_CACHE_TTL_MS = 5 * 60 * 1000;
const PLAYLIST_TRACKS_CACHE_TTL_MS = 10 * 60 * 1000;
const FAVORITE_ARTISTS_CACHE_TTL_MS = 15 * 60 * 1000;
const TOP_ARTISTS_CACHE_TTL_MS = 15 * 60 * 1000;
const ACTIVITY_BOOTSTRAP_CACHE_TTL_MS = 30 * 1000;

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
type ActivityBootstrapCacheValue = {
  favoriteArtists: TopArtistsCacheValue;
  playlists: PlaylistsPageCacheValue["items"];
  playlistsTotal: number;
  recentTracks: RecentlyPlayedItems;
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

export const recentlyPlayed = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: recentlyPlayedResultValidator,
  handler: async (ctx, args) => {
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
  },
});

export const playlistsPage = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: playlistsPageValidator,
  handler: async (ctx, args) => {
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
  },
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
  handler: async (ctx, args) => {
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
  },
});

export const bootstrap = action({
  args: {
    accessToken: v.string(),
    playlistLimit: v.optional(v.number()),
    playlistOffset: v.optional(v.number()),
    topArtistsLimit: v.optional(v.number()),
    recentlyPlayedLimit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: activityBootstrapValidator,
  handler: async (ctx, args) => {
    const cacheKey = `activityBootstrap:${resolveCacheScope(args.cacheScope)}:${args.playlistLimit ?? 50}:${args.playlistOffset ?? 0}:${args.topArtistsLimit ?? 10}:${args.recentlyPlayedLimit ?? 50}`;
    const cached = await getCachedValue<ActivityBootstrapCacheValue>(ctx, cacheKey);
    if (cached) {
      return cached;
    }

    const [recentResult, playlistData, artistData] = await Promise.all([
      getRecentlyPlayed(args.accessToken, args.recentlyPlayedLimit ?? 50).then(
        (items) => ({ items, rateLimited: false }),
        (error: unknown) => {
          if (error instanceof SpotifyApiError && error.status === 429) {
            return { items: [], rateLimited: true };
          }

          throw toActivityError(
            error,
            "Could not load your recent tracks right now.",
          );
        },
      ),
      getUserPlaylists(
        args.accessToken,
        args.playlistLimit ?? 50,
        args.playlistOffset ?? 0,
      ).catch(() => ({ items: [], total: 0 })),
      getTopArtists(args.accessToken, args.topArtistsLimit ?? 10).catch(
        () => [],
      ),
    ]);

    const result = {
      favoriteArtists: artistData,
      playlists: playlistData.items,
      playlistsTotal: playlistData.total,
      recentTracks: recentResult.items,
    };
    await setCachedValue(
      ctx,
      cacheKey,
      result,
      ACTIVITY_BOOTSTRAP_CACHE_TTL_MS,
    );
    return result;
  },
});
