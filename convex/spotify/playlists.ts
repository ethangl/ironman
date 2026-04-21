import type { ActionCtx } from "../_generated/server";

import {
  spotifyPlaylistsPageCache,
  spotifyPlaylistTracksCache,
} from "./playlistsCache";

export const PLAYLISTS_DEFAULT_LIMIT = 50;
export const PLAYLISTS_DEFAULT_OFFSET = 0;

export async function fetchPlaylistsPage(
  ctx: ActionCtx,
  args: {
    limit?: number;
    offset?: number;
    forceRefresh?: boolean;
    cacheScope: string;
  },
) {
  return spotifyPlaylistsPageCache.fetch(
    ctx,
    {
      limit: args.limit ?? PLAYLISTS_DEFAULT_LIMIT,
      offset: args.offset ?? PLAYLISTS_DEFAULT_OFFSET,
      cacheScope: args.cacheScope,
    },
    args.forceRefresh ? { force: true } : undefined,
  );
}

export async function fetchPlaylistTracks(
  ctx: ActionCtx,
  args: {
    playlistId: string;
    cacheScope: string;
  },
) {
  return spotifyPlaylistTracksCache.fetch(ctx, {
    playlistId: args.playlistId,
    cacheScope: args.cacheScope,
  });
}

export async function clearPlaylistsCaches(ctx: ActionCtx) {
  await Promise.all([
    spotifyPlaylistsPageCache.removeAllForName(ctx),
    spotifyPlaylistTracksCache.removeAllForName(ctx),
  ]);
}
