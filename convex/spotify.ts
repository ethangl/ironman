import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { requireAuthUser } from "./betterAuth";
import { clearAlbumsCaches, spotifyAlbumTracksCache } from "./spotify/albums";
import {
  clearArtistsCaches,
  spotifyArtistPageCache,
  spotifyArtistReleasesPageCache,
  spotifyFavoriteArtistsCache,
  spotifyTopArtistsCache,
} from "./spotify/artists";
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from "./spotify/constants";
import {
  getCurrentlyPlaying,
  pausePlayback,
  playUri,
  resumePlayback,
  setRepeatMode,
  setVolumePercent,
} from "./spotify/playback";
import {
  clearPlaylistsCaches,
  spotifyPlaylistCache,
  spotifyPlaylistsPageCache,
  spotifyPlaylistTracksCache,
} from "./spotify/playlists";
import {
  clearSearchCaches,
  spotifySearchResultsCache,
  spotifySearchTracksCache,
} from "./spotify/search";
import {
  clearTracksCaches,
  spotifyRecentlyPlayedCache,
} from "./spotify/tracks";
import {
  spotifyAlbumReleasePageValidator,
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
  spotifyPlaybackCurrentlyPlayingResultValidator,
  spotifyPlaybackResultValidator,
  spotifyPlaylistValidator,
  spotifyPlaylistsPageValidator,
  spotifyRecentlyPlayedPageResultValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./spotify/validators";
import { requireSpotifyAccessToken } from "./spotifySession";

const SPOTIFY_AUTH_COOLDOWN_KEY = "spotify-auth-cooldown";

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

export const artistReleasesPage = action({
  args: {
    artistId: v.string(),
    includeGroups: v.union(v.literal("album"), v.literal("single")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: spotifyAlbumReleasePageValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    return spotifyArtistReleasesPageCache.fetch(ctx, {
      artistId: args.artistId,
      includeGroups: args.includeGroups,
      limit: args.limit ?? DEFAULT_LIMIT,
      offset: args.offset ?? DEFAULT_OFFSET,
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
    before: v.optional(v.number()),
    forceRefresh: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  returns: spotifyRecentlyPlayedPageResultValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    return spotifyRecentlyPlayedCache.fetch(
      ctx,
      {
        before: args.before ?? null,
        limit: args.limit ?? DEFAULT_LIMIT,
        cacheScope: String(user._id),
      },
      args.forceRefresh ? { force: true } : undefined,
    );
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
        limit: args.limit ?? DEFAULT_LIMIT,
        offset: args.offset ?? DEFAULT_OFFSET,
        cacheScope: String(user._id),
      },
      args.forceRefresh ? { force: true } : undefined,
    );
  },
});

export const playlist = action({
  args: {
    playlistId: v.string(),
  },
  returns: v.union(spotifyPlaylistValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    return spotifyPlaylistCache.fetch(ctx, {
      playlistId: args.playlistId,
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
      limit: args.limit ?? DEFAULT_LIMIT,
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
        limit: args.limit ?? DEFAULT_LIMIT,
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
      clearSearchCaches(ctx),
      clearArtistsCaches(ctx),
      clearAlbumsCaches(ctx),
      clearTracksCaches(ctx),
      clearPlaylistsCaches(ctx),
      ctx.runMutation(internal.spotifyAuthCooldown.clear, {
        key: SPOTIFY_AUTH_COOLDOWN_KEY,
      }),
    ]);
    return null;
  },
});

export const playbackCurrentlyPlaying = action({
  args: {},
  returns: spotifyPlaybackCurrentlyPlayingResultValidator,
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return getCurrentlyPlaying(accessToken);
  },
});

export const playbackPlay = action({
  args: {
    uri: v.string(),
    deviceId: v.optional(v.string()),
    offsetMs: v.optional(v.number()),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return playUri(args.uri, accessToken, args.deviceId, args.offsetMs);
  },
});

export const playbackResume = action({
  args: {},
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return resumePlayback(accessToken);
  },
});

export const playbackPause = action({
  args: {},
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return pausePlayback(accessToken);
  },
});

export const playbackSetRepeat = action({
  args: {
    state: v.union(v.literal("track"), v.literal("context"), v.literal("off")),
    deviceId: v.optional(v.string()),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return setRepeatMode(args.state, accessToken, args.deviceId);
  },
});

export const playbackSetVolume = action({
  args: {
    percent: v.number(),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);
    return setVolumePercent(args.percent, accessToken);
  },
});
