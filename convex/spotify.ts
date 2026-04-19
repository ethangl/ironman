import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
  requireAuthUser,
  requireSpotifyAccessToken,
} from "./spotifySession";
import {
  spotifyAlbumTracksCache,
  spotifyArtistPageCache,
  spotifyFavoriteArtistsCache,
  spotifyPlaylistsPageCache,
  spotifyPlaylistTracksCache,
  spotifyRecentlyPlayedCache,
  spotifySearchResultsCache,
  spotifySearchTracksCache,
  spotifyTopArtistsCache,
} from "./spotifyCaches";
import {
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
  spotifyPlaylistsPageValidator,
  spotifyRecentlyPlayedResultValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./components/spotify/validators";

const RECENTLY_PLAYED_DEFAULT_LIMIT = 30;
const PLAYLISTS_DEFAULT_LIMIT = 50;
const PLAYLISTS_DEFAULT_OFFSET = 0;
const FAVORITE_ARTISTS_DEFAULT_LIMIT = 50;
const TOP_ARTISTS_DEFAULT_LIMIT = 10;
const SPOTIFY_AUTH_COOLDOWN_KEY = "spotify-auth-cooldown";

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
    await requireAuthUser(ctx);
    return spotifySearchResultsCache.fetch(ctx, { query: args.query });
  },
});

export const searchTracks = action({
  args: {
    query: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    await requireAuthUser(ctx);
    return spotifySearchTracksCache.fetch(ctx, { query: args.query });
  },
});

export const artistPage = action({
  args: {
    artistId: v.string(),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    return spotifyArtistPageCache.fetch(ctx, {
      artistId: args.artistId,
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
    await requireAuthUser(ctx);
    return spotifyAlbumTracksCache.fetch(ctx, { albumId: args.albumId });
  },
});

export const recentlyPlayed = action({
  args: {
    limit: v.optional(v.number()),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    return spotifyRecentlyPlayedCache.fetch(ctx, {
      limit: args.limit ?? RECENTLY_PLAYED_DEFAULT_LIMIT,
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
    const user = await requireAuthUser(ctx);
    return spotifyPlaylistsPageCache.fetch(
      ctx,
      {
        limit: args.limit ?? PLAYLISTS_DEFAULT_LIMIT,
        offset: args.offset ?? PLAYLISTS_DEFAULT_OFFSET,
        cacheScope: String(user._id),
      },
      args.forceRefresh ? { force: true } : undefined,
    );
  },
});

export const playlistTracks = action({
  args: {
    playlistId: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    return spotifyPlaylistTracksCache.fetch(ctx, {
      playlistId: args.playlistId,
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
    return spotifyTopArtistsCache.fetch(ctx, {
      limit: args.limit ?? TOP_ARTISTS_DEFAULT_LIMIT,
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
    const user = await requireAuthUser(ctx);
    return spotifyFavoriteArtistsCache.fetch(
      ctx,
      {
        limit: args.limit ?? FAVORITE_ARTISTS_DEFAULT_LIMIT,
        cacheScope: String(user._id),
      },
      args.forceRefresh ? { force: true } : undefined,
    );
  },
});

export const clearCache = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireAuthUser(ctx);
    await Promise.all([
      spotifySearchResultsCache.removeAllForName(ctx),
      spotifySearchTracksCache.removeAllForName(ctx),
      spotifyArtistPageCache.removeAllForName(ctx),
      spotifyAlbumTracksCache.removeAllForName(ctx),
      spotifyRecentlyPlayedCache.removeAllForName(ctx),
      spotifyPlaylistsPageCache.removeAllForName(ctx),
      spotifyPlaylistTracksCache.removeAllForName(ctx),
      spotifyTopArtistsCache.removeAllForName(ctx),
      spotifyFavoriteArtistsCache.removeAllForName(ctx),
      ctx.runMutation(internal.spotifyAuthCooldown.clear, {
        key: SPOTIFY_AUTH_COOLDOWN_KEY,
      }),
    ]);
    return null;
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
