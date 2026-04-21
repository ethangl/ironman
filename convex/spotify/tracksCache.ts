import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import type { SpotifyRecentlyPlayedResult } from "../components/spotify/types";
import { components } from "../_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const loadRecentlyPlayedRef =
  anyApi.spotify.tracksLoaders.loadRecentlyPlayed as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyRecentlyPlayedResult
  >;

export const spotifyRecentlyPlayedCache = new ActionCache(
  components.actionCache,
  {
    action: loadRecentlyPlayedRef,
    name: "spotify-recently-played-v1",
    ttl: DAY_IN_MS,
  },
);
