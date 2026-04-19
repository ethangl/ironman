import { v } from "convex/values";

import { components } from "./_generated/api";
import { action } from "./_generated/server";
import { musicBrainzArtistMatchValidator } from "./components/musicbrainz/validators";

export const artistBySpotifyId = action({
  args: {
    spotifyArtistId: v.string(),
  },
  returns: v.union(musicBrainzArtistMatchValidator, v.null()),
  handler: async (ctx, args) => {
    return ctx.runAction(components.musicbrainz.artists.artistBySpotifyId, args);
  },
});

export const spotifyArtistIdByMusicBrainzId = action({
  args: {
    musicBrainzArtistId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return ctx.runAction(
      components.musicbrainz.artists.spotifyArtistIdByMusicBrainzId,
      args,
    );
  },
});
