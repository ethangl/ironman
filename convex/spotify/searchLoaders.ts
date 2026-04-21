import { v } from "convex/values";

import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import {
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "../components/spotify/validators";

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
