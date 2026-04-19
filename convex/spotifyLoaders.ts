import { v } from "convex/values";

import { components } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { requireSpotifyAccessToken } from "./spotifySession";
import {
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
  spotifyPlaylistsPageValidator,
  spotifyRecentlyPlayedResultValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./components/spotify/validators";

export const loadSearchResults = internalAction({
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

export const loadSearchTracks = internalAction({
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

export const loadArtistPage = internalAction({
  args: {
    artistId: v.string(),
    cacheScope: v.string(),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.search.artistPage, {
      artistId: args.artistId,
      accessToken,
      cacheScope: args.cacheScope,
    });
  },
});

export const loadAlbumTracks = internalAction({
  args: {
    albumId: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.search.albumTracks, {
      albumId: args.albumId,
      accessToken,
    });
  },
});

export const loadRecentlyPlayed = internalAction({
  args: {
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.recentlyPlayed, {
      accessToken,
      limit: args.limit,
      cacheScope: args.cacheScope,
    });
  },
});

export const loadPlaylistsPage = internalAction({
  args: {
    limit: v.number(),
    offset: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.playlistsPage, {
      accessToken,
      limit: args.limit,
      offset: args.offset,
      cacheScope: args.cacheScope,
    });
  },
});

export const loadPlaylistTracks = internalAction({
  args: {
    playlistId: v.string(),
    cacheScope: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.playlistTracks, {
      accessToken,
      playlistId: args.playlistId,
      cacheScope: args.cacheScope,
    });
  },
});

export const loadTopArtists = internalAction({
  args: {
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.topArtists, {
      accessToken,
      limit: args.limit,
      cacheScope: args.cacheScope,
    });
  },
});

export const loadFavoriteArtists = internalAction({
  args: {
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.activity.favoriteArtists, {
      accessToken,
      limit: args.limit,
      cacheScope: args.cacheScope,
    });
  },
});
