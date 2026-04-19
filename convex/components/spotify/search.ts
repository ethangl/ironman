import { v } from "convex/values";

import {
  getAlbumTracks,
  getArtistPageDataResult,
  getSpotifyProfileMarket,
  searchSpotify,
  searchTracks as searchTracksByName,
} from "./searchApi";
import { action, type ActionCtx } from "./_generated/server";
import { SpotifyApiError } from "./errors";
import {
  spotifyArtistPageDataValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./validators";

async function getArtistPageMarket(
  accessToken: string,
) {
  try {
    return await getSpotifyProfileMarket(accessToken);
  } catch (error) {
    if (
      error instanceof SpotifyApiError &&
      error.status !== 401 &&
      error.status !== 403
    ) {
      return null;
    }

    throw error;
  }
}

function toSearchError(error: unknown) {
  if (!(error instanceof SpotifyApiError)) {
    return new Error("Could not search Spotify right now.");
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Reconnect Spotify to search.");
  }

  if (error.status === 429) {
    return new Error("Spotify is rate limiting search right now.");
  }

  return new Error("Could not search Spotify right now.");
}
export const searchResults = action({
  args: {
    query: v.string(),
    accessToken: v.string(),
  },
  returns: spotifySearchResultsValidator,
  handler: async (ctx, args) => {
    try {
      return await searchSpotify(args.query, args.accessToken);
    } catch (error) {
      throw toSearchError(error);
    }
  },
});

export const searchTracks = action({
  args: {
    query: v.string(),
    accessToken: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    try {
      return await searchTracksByName(args.query, args.accessToken);
    } catch (error) {
      throw toSearchError(error);
    }
  },
});

export const artistPage = action({
  args: {
    artistId: v.string(),
    accessToken: v.string(),
    cacheScope: v.optional(v.string()),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (ctx, args) => {
    try {
      const market = await getArtistPageMarket(args.accessToken);
      const { page } = await getArtistPageDataResult(
        args.accessToken,
        args.artistId,
        market,
      );
      return page;
    } catch (error) {
      if (error instanceof SpotifyApiError && error.status === 404) {
        return null;
      }
      throw toSearchError(error);
    }
  },
});

export const albumTracks = action({
  args: {
    albumId: v.string(),
    accessToken: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (_ctx, args) => {
    try {
      return await getAlbumTracks(args.accessToken, args.albumId);
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        if (error.status === 401 || error.status === 403) {
          throw new Error("Reconnect Spotify to load album tracks.");
        }

        if (error.status === 429) {
          throw new Error("Spotify is rate limiting album requests right now.");
        }
      }

      throw new Error("Could not load album tracks.");
    }
  },
});
