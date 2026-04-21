import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import type { SpotifySearchResults, SpotifyTrack } from "../components/spotify/types";
import { components } from "../_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const loadSearchResultsRef =
  anyApi.spotify.searchLoaders.loadSearchResults as FunctionReference<
    "action",
    "internal",
    {
      query: string;
    },
    SpotifySearchResults
  >;

const loadSearchTracksRef =
  anyApi.spotify.searchLoaders.loadSearchTracks as FunctionReference<
    "action",
    "internal",
    {
      query: string;
    },
    SpotifyTrack[]
  >;

export const spotifySearchResultsCache = new ActionCache(
  components.actionCache,
  {
    action: loadSearchResultsRef,
    name: "spotify-search-results-v1",
    ttl: DAY_IN_MS,
  },
);

export const spotifySearchTracksCache = new ActionCache(components.actionCache, {
  action: loadSearchTracksRef,
  name: "spotify-search-tracks-v1",
  ttl: DAY_IN_MS,
});
