import { v } from "convex/values";

import { components } from "./_generated/api";
import { action } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth";
import {
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
  spotifyPlaylistsPageValidator,
  spotifyRecentlyPlayedResultValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./components/spotify/validators";

const SPOTIFY_ACCESS_TOKEN_EXPIRY_SKEW_MS = 30_000;
const SPOTIFY_ACCESS_TOKEN_FALLBACK_TTL_MS = 60_000;

const spotifyAccessTokenCache = new Map<
  string,
  { accessToken: string; expiresAt: number }
>();
const spotifyAccessTokenInFlight = new Map<string, Promise<string>>();

async function requireAuthUser(ctx: unknown) {
  const user = await authComponent.getAuthUser(
    ctx as Parameters<typeof authComponent.getAuthUser>[0],
  );
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function normalizeExpiry(expiresAt: Date | number | null | undefined) {
  if (expiresAt instanceof Date) {
    return expiresAt.getTime();
  }

  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
    return Date.now() + SPOTIFY_ACCESS_TOKEN_FALLBACK_TTL_MS;
  }

  return expiresAt > 1_000_000_000_000 ? expiresAt : expiresAt * 1000;
}

function getCachedSpotifyAccessToken(userId: string) {
  const cached = spotifyAccessTokenCache.get(userId);
  if (!cached) {
    return null;
  }

  if (Date.now() < cached.expiresAt - SPOTIFY_ACCESS_TOKEN_EXPIRY_SKEW_MS) {
    return cached.accessToken;
  }

  spotifyAccessTokenCache.delete(userId);
  return null;
}

async function requireSpotifySession(ctx: unknown) {
  const user = await requireAuthUser(ctx);
  const userId = String(user._id);
  const cachedAccessToken = getCachedSpotifyAccessToken(userId);
  if (cachedAccessToken) {
    return {
      user,
      accessToken: cachedAccessToken,
    };
  }

  let inFlight = spotifyAccessTokenInFlight.get(userId);
  if (!inFlight) {
    inFlight = (async () => {
      const { auth, headers } = await authComponent.getAuth(
        createAuth,
        ctx as Parameters<typeof authComponent.getAuth>[1],
      );

      const tokens = await auth.api.getAccessToken({
        body: { providerId: "spotify" },
        headers,
      });

      if (!tokens?.accessToken) {
        throw new Error("Missing Spotify access token.");
      }

      spotifyAccessTokenCache.set(userId, {
        accessToken: tokens.accessToken,
        expiresAt: normalizeExpiry(tokens.accessTokenExpiresAt),
      });
      return tokens.accessToken;
    })()
      .catch((error) => {
        spotifyAccessTokenCache.delete(userId);
        throw error;
      })
      .finally(() => {
        if (spotifyAccessTokenInFlight.get(userId) === inFlight) {
          spotifyAccessTokenInFlight.delete(userId);
        }
      });
    spotifyAccessTokenInFlight.set(userId, inFlight);
  }

  try {
    const accessToken = await inFlight;
    return {
      user,
      accessToken,
    };
  } catch {
    throw new Error("Reconnect Spotify to continue.");
  }
}

async function requireSpotifyAccessToken(ctx: unknown) {
  const session = await requireSpotifySession(ctx);
  return session.accessToken;
}

const playbackArtistValidator = v.object({
  name: v.string(),
});

const playbackItemValidator = v.union(
  v.object({
    id: v.string(),
    name: v.string(),
    duration_ms: v.number(),
    artists: v.optional(v.array(playbackArtistValidator)),
  }),
  v.null(),
);

const playbackStateValidator = v.union(
  v.object({
    is_playing: v.boolean(),
    progress_ms: v.number(),
    item: playbackItemValidator,
  }),
  v.null(),
);

const playResultValidator = v.object({
  ok: v.boolean(),
  retryAfterSeconds: v.optional(v.number()),
  status: v.number(),
});

export const search = action({
  args: {
    query: v.string(),
  },
  returns: spotifySearchResultsValidator,
  handler: async (ctx, args) => {
    const { user, accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.search.searchResults, {
      query: args.query,
      accessToken,
    });
  },
});

export const searchTracks = action({
  args: {
    query: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const { accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.search.searchTracks, {
      query: args.query,
      accessToken,
    });
  },
});

export const artistPage = action({
  args: {
    artistId: v.string(),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (ctx, args) => {
    const { user, accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.search.artistPage, {
      artistId: args.artistId,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const albumTracks = action({
  args: {
    albumId: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.search.albumTracks, {
      ...args,
      accessToken,
    });
  },
});

export const recentlyPlayed = action({
  args: {
    limit: v.optional(v.number()),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (ctx, args) => {
    const { user, accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.activity.recentlyPlayed, {
      ...args,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const playlistsPage = action({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (ctx, args) => {
    const { user, accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.activity.playlistsPage, {
      ...args,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const playlistsPageCached = action({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    return ctx.runAction(components.spotify.activity.playlistsPageCached, {
      ...args,
      cacheScope: String(user._id),
    });
  },
});

export const playlistTracks = action({
  args: {
    playlistId: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const { user, accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.activity.playlistTracks, {
      ...args,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const topArtists = action({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const { user, accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.activity.topArtists, {
      ...args,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const favoriteArtists = action({
  args: {
    limit: v.optional(v.number()),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const { user, accessToken } = await requireSpotifySession(ctx);

    return ctx.runAction(components.spotify.activity.favoriteArtists, {
      ...args,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const favoriteArtistsCached = action({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    return ctx.runAction(components.spotify.activity.favoriteArtistsCached, {
      ...args,
      cacheScope: String(user._id),
    });
  },
});

export const clearCache = action({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await requireAuthUser(ctx);
    return ctx.runMutation(components.spotify.cache.clear, {});
  },
});

export const playbackCurrentlyPlaying = action({
  args: {},
  returns: v.object({
    retryAfterSeconds: v.optional(v.number()),
    status: v.number(),
    playback: playbackStateValidator,
  }),
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playback.currentlyPlaying, {
      accessToken,
    });
  },
});

export const playbackPlay = action({
  args: {
    uri: v.string(),
    deviceId: v.optional(v.string()),
  },
  returns: playResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playback.play, {
      ...args,
      accessToken,
    });
  },
});

export const playbackResume = action({
  args: {},
  returns: playResultValidator,
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playback.resume, {
      accessToken,
    });
  },
});

export const playbackPause = action({
  args: {},
  returns: playResultValidator,
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playback.pause, {
      accessToken,
    });
  },
});

export const playbackSetRepeat = action({
  args: {
    state: v.union(v.literal("track"), v.literal("context"), v.literal("off")),
    deviceId: v.optional(v.string()),
  },
  returns: playResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playback.setRepeat, {
      ...args,
      accessToken,
    });
  },
});

export const playbackSetVolume = action({
  args: {
    percent: v.number(),
  },
  returns: playResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playback.setVolume, {
      ...args,
      accessToken,
    });
  },
});
