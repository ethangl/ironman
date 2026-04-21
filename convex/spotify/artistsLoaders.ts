import { v } from "convex/values";

import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import {
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
} from "../components/spotify/validators";

export const loadArtistPage = internalAction({
  args: {
    artistId: v.string(),
    cacheScope: v.string(),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.artists.artistPage, {
      artistId: args.artistId,
      accessToken,
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

    return ctx.runAction(components.spotify.artists.topArtists, {
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

    return ctx.runAction(components.spotify.artists.favoriteArtists, {
      accessToken,
      limit: args.limit,
      cacheScope: args.cacheScope,
    });
  },
});
