import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import type { LastFmArtistMatch } from "./client";
import { components } from "./_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const loadArtistDetailsRef =
  anyApi.loaders.loadArtistDetails as FunctionReference<
    "action",
    "internal",
    {
      apiKey: string;
      artistName: string | null;
      musicBrainzId: string | null;
    },
    LastFmArtistMatch | null
  >;

export const artistDetailsCache = new ActionCache(components.actionCache, {
  action: loadArtistDetailsRef,
  name: "lastfm-artist-details-v1",
  ttl: DAY_IN_MS,
});
