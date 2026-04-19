import { v } from "convex/values";

import {
  getFavoriteArtists,
  getPlaylistTracks,
  getRecentlyPlayed,
  getTopArtists,
  getUserPlaylists,
} from "./activityApi";
import { action } from "./_generated/server";
import { SpotifyApiError } from "./errors";
import {
  spotifyArtistValidator,
  spotifyPlaylistsPageValidator,
  spotifyRecentlyPlayedResultValidator,
  spotifyTrackValidator,
} from "./validators";

const RECENTLY_PLAYED_LIMIT = 30;

type RecentlyPlayedItems = Awaited<ReturnType<typeof getRecentlyPlayed>>;
type RecentlyPlayedCacheValue = {
  items: RecentlyPlayedItems;
  rateLimited: boolean;
};
type PlaylistsPageCacheValue = Awaited<ReturnType<typeof getUserPlaylists>>;
type PlaylistTracksCacheValue = Awaited<ReturnType<typeof getPlaylistTracks>>;
type FavoriteArtistsCacheValue = Awaited<ReturnType<typeof getFavoriteArtists>>;
type TopArtistsCacheValue = Awaited<ReturnType<typeof getTopArtists>>;

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
  args: {
    accessToken: string;
    limit?: number;
    cacheScope?: string;
  },
): Promise<RecentlyPlayedCacheValue> {
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

    throw toActivityError(
      error,
      "Could not load your recent tracks right now.",
    );
  }
}

async function loadPlaylistsPageResult(
  args: {
    accessToken: string;
    limit?: number;
    offset?: number;
    cacheScope?: string;
    forceRefresh?: boolean;
  },
): Promise<PlaylistsPageCacheValue> {
  const limit = args.limit ?? 50;
  const offset = args.offset ?? 0;

  try {
    return await getUserPlaylists(args.accessToken, limit, offset);
  } catch {
    return { items: [], total: 0 };
  }
}

async function loadFavoriteArtistsResult(
  args: {
    accessToken: string;
    limit?: number;
    cacheScope?: string;
    forceRefresh?: boolean;
  },
): Promise<FavoriteArtistsCacheValue> {
  const limit = args.limit ?? 50;

  try {
    return await getFavoriteArtists(args.accessToken, limit);
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
  handler: async (_ctx, args) => loadRecentlyPlayedResult(args),
});

export const playlistsPage = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (_ctx, args) => loadPlaylistsPageResult(args),
});

export const playlistTracks = action({
  args: {
    accessToken: v.string(),
    playlistId: v.string(),
    cacheScope: v.optional(v.string()),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (_ctx, args) => {
    try {
      return await getPlaylistTracks(args.accessToken, args.playlistId);
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
  handler: async (_ctx, args) => {
    try {
      return await getTopArtists(args.accessToken, args.limit ?? 10);
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
    forceRefresh: v.optional(v.boolean()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (_ctx, args) => loadFavoriteArtistsResult(args),
});
