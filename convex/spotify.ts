import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
  requireAuthUser,
  requireSpotifyAccessToken,
} from "./spotifySession";
import {
  fetchAlbumTracks,
  clearAlbumsCaches,
} from "./spotify/albums";
import {
  clearArtistsCaches,
  fetchArtistPage,
  fetchFavoriteArtists,
  fetchTopArtists,
} from "./spotify/artists";
import {
  clearPlaylistsCaches,
  fetchPlaylistsPage,
  fetchPlaylistTracks,
} from "./spotify/playlists";
import {
  fetchPlaybackCurrentlyPlaying,
  pausePlayback,
  playPlaybackUri,
  resumePlayback,
  setPlaybackRepeat,
  setPlaybackVolume,
} from "./spotify/playback";
import { clearSearchCaches, fetchSearchResults, fetchSearchTracks } from "./spotify/search";
import { clearTracksCaches, fetchRecentlyPlayed } from "./spotify/tracks";
import {
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
  spotifyPlaybackCurrentlyPlayingResultValidator,
  spotifyPlaybackResultValidator,
  spotifyPlaylistsPageValidator,
  spotifyRecentlyPlayedResultValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./components/spotify/validators";

const SPOTIFY_AUTH_COOLDOWN_KEY = "spotify-auth-cooldown";
export const search = action({
  args: {
    query: v.string(),
  },
  returns: spotifySearchResultsValidator,
  handler: async (ctx, args) => {
    await requireAuthUser(ctx);
    return fetchSearchResults(ctx, { query: args.query });
  },
});

export const searchTracks = action({
  args: {
    query: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    await requireAuthUser(ctx);
    return fetchSearchTracks(ctx, { query: args.query });
  },
});

export const artistPage = action({
  args: {
    artistId: v.string(),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    return fetchArtistPage(ctx, {
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
    return fetchAlbumTracks(ctx, { albumId: args.albumId });
  },
});

export const recentlyPlayed = action({
  args: {
    limit: v.optional(v.number()),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    return fetchRecentlyPlayed(ctx, {
      limit: args.limit,
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
    return fetchPlaylistsPage(ctx, {
      limit: args.limit,
      offset: args.offset,
      forceRefresh: args.forceRefresh,
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
    return fetchPlaylistTracks(ctx, {
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
    return fetchTopArtists(ctx, {
      limit: args.limit,
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
    return fetchFavoriteArtists(ctx, {
      limit: args.limit,
      forceRefresh: args.forceRefresh,
      cacheScope: String(user._id),
    });
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

    return fetchPlaybackCurrentlyPlaying(ctx, accessToken);
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

    return playPlaybackUri(ctx, {
      ...args,
      accessToken,
    });
  },
});

export const playbackResume = action({
  args: {},
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return resumePlayback(ctx, accessToken);
  },
});

export const playbackPause = action({
  args: {},
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return pausePlayback(ctx, accessToken);
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

    return setPlaybackRepeat(ctx, {
      ...args,
      accessToken,
    });
  },
});

export const playbackSetVolume = action({
  args: {
    percent: v.number(),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return setPlaybackVolume(ctx, {
      ...args,
      accessToken,
    });
  },
});
