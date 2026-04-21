import type { ActionCtx } from "../_generated/server";

import { spotifyAlbumTracksCache } from "./albumsCache";

export async function fetchAlbumTracks(
  ctx: ActionCtx,
  args: {
    albumId: string;
  },
) {
  return spotifyAlbumTracksCache.fetch(ctx, { albumId: args.albumId });
}

export async function clearAlbumsCaches(ctx: ActionCtx) {
  await spotifyAlbumTracksCache.removeAllForName(ctx);
}
