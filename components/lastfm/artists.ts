import { v } from "convex/values";

import { action } from "./_generated/server";
import { artistDetailsCache } from "./caches";
import { LastFmApiError } from "./errors";
import { lastFmArtistMatchValidator } from "./validators";

function normalizeArtistName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function toLookupError(error: unknown) {
  if (error instanceof LastFmApiError) {
    return new Error("Could not load Last.fm artist details right now.");
  }

  return new Error("Could not load Last.fm artist details right now.");
}

export const artistDetails = action({
  args: {
    apiKey: v.string(),
    artistName: v.union(v.string(), v.null()),
    musicBrainzId: v.union(v.string(), v.null()),
  },
  returns: v.union(lastFmArtistMatchValidator, v.null()),
  handler: async (ctx, args) => {
    const apiKey = args.apiKey.trim();
    const artistName = args.artistName?.trim() || null;
    const musicBrainzId = args.musicBrainzId?.trim() || null;

    if (!apiKey || (!artistName && !musicBrainzId)) {
      return null;
    }

    try {
      return await artistDetailsCache.fetch(ctx, {
        apiKey,
        artistName: artistName ? normalizeArtistName(artistName) : null,
        musicBrainzId,
      });
    } catch (error) {
      throw toLookupError(error);
    }
  },
});
