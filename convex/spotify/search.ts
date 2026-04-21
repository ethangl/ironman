import type { ActionCtx } from "../_generated/server";

import {
  spotifySearchResultsCache,
  spotifySearchTracksCache,
} from "./searchCache";

export async function fetchSearchResults(
  ctx: ActionCtx,
  args: {
    query: string;
  },
) {
  return spotifySearchResultsCache.fetch(ctx, { query: args.query });
}

export async function fetchSearchTracks(
  ctx: ActionCtx,
  args: {
    query: string;
  },
) {
  return spotifySearchTracksCache.fetch(ctx, { query: args.query });
}

export async function clearSearchCaches(ctx: ActionCtx) {
  await Promise.all([
    spotifySearchResultsCache.removeAllForName(ctx),
    spotifySearchTracksCache.removeAllForName(ctx),
  ]);
}
