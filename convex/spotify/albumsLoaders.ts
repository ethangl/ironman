import { v } from "convex/values";

import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import { spotifyTrackValidator } from "../components/spotify/validators";

export const loadAlbumTracks = internalAction({
  args: {
    albumId: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.albums.albumTracks, {
      albumId: args.albumId,
      accessToken,
    });
  },
});
