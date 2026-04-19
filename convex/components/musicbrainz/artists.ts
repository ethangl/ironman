import { v } from "convex/values";

import { action } from "./_generated/server";
import {
  artistBySpotifyIdCache,
  spotifyArtistIdByMusicBrainzIdCache,
} from "./caches";
import { MusicBrainzApiError } from "./errors";
import { musicBrainzArtistMatchValidator } from "./validators";

function toLookupError(error: unknown) {
  if (error instanceof MusicBrainzApiError && error.status === 404) {
    return null;
  }

  if (error instanceof MusicBrainzApiError) {
    return new Error("Could not load MusicBrainz artist details right now.");
  }

  return new Error("Could not load MusicBrainz artist details right now.");
}

export const artistBySpotifyId = action({
  args: {
    spotifyArtistId: v.string(),
  },
  returns: v.union(musicBrainzArtistMatchValidator, v.null()),
  handler: async (ctx, args) => {
    const spotifyArtistId = args.spotifyArtistId.trim();
    if (!spotifyArtistId) {
      return null;
    }

    try {
      return await artistBySpotifyIdCache.fetch(ctx, { spotifyArtistId });
    } catch (error) {
      const lookupError = toLookupError(error);
      if (lookupError === null) {
        return null;
      }
      throw lookupError;
    }
  },
});

export const spotifyArtistIdByMusicBrainzId = action({
  args: {
    musicBrainzArtistId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const musicBrainzArtistId = args.musicBrainzArtistId.trim();
    if (!musicBrainzArtistId) {
      return null;
    }

    try {
      return await spotifyArtistIdByMusicBrainzIdCache.fetch(ctx, {
        musicBrainzArtistId,
      });
    } catch (error) {
      const lookupError = toLookupError(error);
      if (lookupError === null) {
        return null;
      }
      throw lookupError;
    }
  },
});
