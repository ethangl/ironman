import { v } from "convex/values";

import {
  getArtistPageData,
  searchSpotify,
  searchTracks as searchTracksByName,
} from "./searchApi";
import { action } from "./_generated/server";
import { getCachedValue, setCachedValue } from "./cacheHelpers";
import { SpotifyApiError } from "./errors";
import {
  spotifyArtistPageDataValidator,
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./validators";

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const ARTIST_PAGE_CACHE_TTL_MS = 30 * 60 * 1000;

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
    const cacheKey = `search:${args.query.trim().toLowerCase()}`;
    const cached = await getCachedValue<Awaited<ReturnType<typeof searchSpotify>>>(
      ctx,
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    try {
      const results = await searchSpotify(args.query, args.accessToken);
      await setCachedValue(ctx, cacheKey, results, SEARCH_CACHE_TTL_MS);
      return results;
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
    const cacheKey = `searchTracks:${args.query.trim().toLowerCase()}`;
    const cached = await getCachedValue<
      Awaited<ReturnType<typeof searchTracksByName>>
    >(ctx, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const tracks = await searchTracksByName(args.query, args.accessToken);
      await setCachedValue(ctx, cacheKey, tracks, SEARCH_CACHE_TTL_MS);
      return tracks;
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
    const cacheScope = args.cacheScope ?? "global";
    const cacheKey = `artistPage:${cacheScope}:${args.artistId}`;
    const cached = await getCachedValue<
      Awaited<ReturnType<typeof getArtistPageData>> | null
    >(ctx, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const page = await getArtistPageData(args.accessToken, args.artistId);
      await setCachedValue(ctx, cacheKey, page, ARTIST_PAGE_CACHE_TTL_MS);
      return page;
    } catch (error) {
      if (error instanceof SpotifyApiError && error.status === 404) {
        await setCachedValue(ctx, cacheKey, null, ARTIST_PAGE_CACHE_TTL_MS);
        return null;
      }

      throw toSearchError(error);
    }
  },
});
