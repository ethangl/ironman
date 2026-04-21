import { v } from "convex/values";

import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import { spotifyRecentlyPlayedResultValidator } from "../components/spotify/validators";

export const loadRecentlyPlayed = internalAction({
  args: {
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyRecentlyPlayedResultValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.tracks.recentlyPlayed, {
      accessToken,
      limit: args.limit,
      cacheScope: args.cacheScope,
    });
  },
});
