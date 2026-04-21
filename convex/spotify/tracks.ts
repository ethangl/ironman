import type { ActionCtx } from "../_generated/server";

import { spotifyRecentlyPlayedCache } from "./tracksCache";

export const RECENTLY_PLAYED_DEFAULT_LIMIT = 30;

export async function fetchRecentlyPlayed(
  ctx: ActionCtx,
  args: {
    limit?: number;
    cacheScope: string;
  },
) {
  return spotifyRecentlyPlayedCache.fetch(ctx, {
    limit: args.limit ?? RECENTLY_PLAYED_DEFAULT_LIMIT,
    cacheScope: args.cacheScope,
  });
}

export async function clearTracksCaches(ctx: ActionCtx) {
  await spotifyRecentlyPlayedCache.removeAllForName(ctx);
}
