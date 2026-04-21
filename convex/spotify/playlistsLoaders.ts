import { v } from "convex/values";

import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import {
  spotifyPlaylistsPageValidator,
  spotifyTrackValidator,
} from "../components/spotify/validators";

export const loadPlaylistsPage = internalAction({
  args: {
    limit: v.number(),
    offset: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playlists.playlistsPage, {
      accessToken,
      limit: args.limit,
      offset: args.offset,
      cacheScope: args.cacheScope,
    });
  },
});

export const loadPlaylistTracks = internalAction({
  args: {
    playlistId: v.string(),
    cacheScope: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    return ctx.runAction(components.spotify.playlists.playlistTracks, {
      accessToken,
      playlistId: args.playlistId,
      cacheScope: args.cacheScope,
    });
  },
});
