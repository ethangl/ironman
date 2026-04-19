import { v } from "convex/values";

import { components } from "./_generated/api";
import { action } from "./_generated/server";
import { lastFmArtistMatchValidator } from "./components/lastfm/validators";

function getLastFmApiKey() {
  return process.env.LASTFM_API_KEY ?? process.env.LAST_FM_API_KEY ?? null;
}

export const artistDetails = action({
  args: {
    artistName: v.union(v.string(), v.null()),
    musicBrainzId: v.union(v.string(), v.null()),
  },
  returns: v.union(lastFmArtistMatchValidator, v.null()),
  handler: async (ctx, args) => {
    const apiKey = getLastFmApiKey();
    if (!apiKey) {
      return null;
    }

    return ctx.runAction(components.lastfm.artists.artistDetails, {
      apiKey,
      artistName: args.artistName,
      musicBrainzId: args.musicBrainzId,
    });
  },
});
