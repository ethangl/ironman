import { v } from "convex/values";

import { components } from "./_generated/api";
import { action } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth";
import {
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
  spotifyPlaylistValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./components/spotify/validators";

async function requireAuthUser(ctx: unknown) {
  const user = await authComponent.getAuthUser(
    ctx as Parameters<typeof authComponent.getAuthUser>[0],
  );
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function requireSpotifyAccessToken(ctx: unknown) {
  await requireAuthUser(ctx);

  const { auth, headers } = await authComponent.getAuth(
    createAuth,
    ctx as Parameters<typeof authComponent.getAuth>[1],
  );

  try {
    const tokens = await auth.api.getAccessToken({
      body: { providerId: "spotify" },
      headers,
    });

    if (!tokens?.accessToken) {
      throw new Error("Missing Spotify access token.");
    }

    return tokens.accessToken;
  } catch {
    throw new Error("Reconnect Spotify to continue.");
  }
}

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
  status: v.number(),
});

export const search = action({
  args: {
    query: v.string(),
  },
  returns: spotifySearchResultsValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

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
    const accessToken = await requireSpotifyAccessToken(ctx);

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
    const user = await requireAuthUser(ctx);
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.search.artistPage, {
      artistId: args.artistId,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const recentlyPlayed = action({
  args: {
    limit: v.optional(v.number()),
  },
  returns: recentlyPlayedResultValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const accessToken = await requireSpotifyAccessToken(ctx);

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
  },
  returns: playlistsPageValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.playlistsPage, {
      ...args,
      accessToken,
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
    const user = await requireAuthUser(ctx);
    const accessToken = await requireSpotifyAccessToken(ctx);

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
    const user = await requireAuthUser(ctx);
    const accessToken = await requireSpotifyAccessToken(ctx);

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
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.favoriteArtists, {
      ...args,
      accessToken,
      cacheScope: String(user._id),
    });
  },
});

export const activityBootstrap = action({
  args: {
    playlistLimit: v.optional(v.number()),
    playlistOffset: v.optional(v.number()),
    topArtistsLimit: v.optional(v.number()),
    recentlyPlayedLimit: v.optional(v.number()),
  },
  returns: activityBootstrapValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.bootstrap, {
      ...args,
      accessToken,
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
