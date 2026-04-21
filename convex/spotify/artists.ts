import type { ActionCtx } from "../_generated/server";

import {
  spotifyArtistPageCache,
  spotifyFavoriteArtistsCache,
  spotifyTopArtistsCache,
} from "./artistsCache";

export const FAVORITE_ARTISTS_DEFAULT_LIMIT = 50;
export const TOP_ARTISTS_DEFAULT_LIMIT = 10;

export async function fetchArtistPage(
  ctx: ActionCtx,
  args: {
    artistId: string;
    cacheScope: string;
  },
) {
  return spotifyArtistPageCache.fetch(ctx, {
    artistId: args.artistId,
    cacheScope: args.cacheScope,
  });
}

export async function fetchTopArtists(
  ctx: ActionCtx,
  args: {
    limit?: number;
    cacheScope: string;
  },
) {
  return spotifyTopArtistsCache.fetch(ctx, {
    limit: args.limit ?? TOP_ARTISTS_DEFAULT_LIMIT,
    cacheScope: args.cacheScope,
  });
}

export async function fetchFavoriteArtists(
  ctx: ActionCtx,
  args: {
    limit?: number;
    forceRefresh?: boolean;
    cacheScope: string;
  },
) {
  return spotifyFavoriteArtistsCache.fetch(
    ctx,
    {
      limit: args.limit ?? FAVORITE_ARTISTS_DEFAULT_LIMIT,
      cacheScope: args.cacheScope,
    },
    args.forceRefresh ? { force: true } : undefined,
  );
}

export async function clearArtistsCaches(ctx: ActionCtx) {
  await Promise.all([
    spotifyArtistPageCache.removeAllForName(ctx),
    spotifyTopArtistsCache.removeAllForName(ctx),
    spotifyFavoriteArtistsCache.removeAllForName(ctx),
  ]);
}
