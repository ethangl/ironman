import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import { spotifyFetch } from "./client";
import { DAY_IN_MS } from "./constants";
import { SpotifyApiError } from "./errors";
import {
  isSpotifyArtist,
  isSpotifyTrack,
  mapArtist,
  mapTrack,
  type SpotifyApiArtist,
  type SpotifyApiTrack,
} from "./mappers";
import type { SpotifySearchResults, SpotifyTrack } from "./types";
import {
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./validators";

interface SearchResponse {
  tracks?: {
    items?: Array<SpotifyApiTrack | null>;
  };
  artists?: {
    items?: Array<SpotifyApiArtist | null>;
  };
}

const loadSearchResultsRef = anyApi["spotify/search"]
  .loadSearchResults as FunctionReference<
  "action",
  "internal",
  {
    query: string;
  },
  SpotifySearchResults
>;

const loadSearchTracksRef = anyApi["spotify/search"]
  .loadSearchTracks as FunctionReference<
  "action",
  "internal",
  {
    query: string;
  },
  SpotifyTrack[]
>;

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

export async function searchTracksByName(
  query: string,
  token: string,
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    token,
  );

  return (data?.tracks?.items ?? []).filter(isSpotifyTrack).map(mapTrack);
}

export async function searchSpotify(
  query: string,
  token: string,
): Promise<SpotifySearchResults> {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track,artist&limit=6`,
    token,
  );

  return {
    tracks: (data?.tracks?.items ?? []).filter(isSpotifyTrack).map(mapTrack),
    artists: (data?.artists?.items ?? [])
      .filter(isSpotifyArtist)
      .map(mapArtist),
  };
}

export const loadSearchResults = internalAction({
  args: {
    query: v.string(),
  },
  returns: spotifySearchResultsValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await searchSpotify(args.query, accessToken);
    } catch (error) {
      throw toSearchError(error);
    }
  },
});

export const loadSearchTracks = internalAction({
  args: {
    query: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await searchTracksByName(args.query, accessToken);
    } catch (error) {
      throw toSearchError(error);
    }
  },
});

export const spotifySearchResultsCache = new ActionCache(
  components.actionCache,
  {
    action: loadSearchResultsRef,
    name: "spotify-search-results-v2",
    ttl: DAY_IN_MS,
  },
);

export const spotifySearchTracksCache = new ActionCache(
  components.actionCache,
  {
    action: loadSearchTracksRef,
    name: "spotify-search-tracks-v1",
    ttl: DAY_IN_MS,
  },
);

export async function clearSearchCaches(ctx: ActionCtx) {
  await Promise.all([
    spotifySearchResultsCache.removeAllForName(ctx),
    spotifySearchTracksCache.removeAllForName(ctx),
  ]);
}
