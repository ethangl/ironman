import { v } from "convex/values";

import {
  lookupArtistBySpotifyId,
  lookupArtistLinksByArtistId,
  lookupSpotifyArtistIdByMusicBrainzArtistId,
} from "./client";
import { api } from "./_generated/api";
import { internalAction, type ActionCtx } from "./_generated/server";
import { musicBrainzArtistMatchValidator } from "./validators";

const MUSICBRAINZ_REQUEST_INTERVAL_MS = 1100;
const MUSICBRAINZ_SCHEDULER_KEY = "url-lookup";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reserveMusicBrainzRequest(ctx: ActionCtx) {
  const waitMs = await ctx.runMutation(api.scheduler.reserve, {
    key: MUSICBRAINZ_SCHEDULER_KEY,
    intervalMs: MUSICBRAINZ_REQUEST_INTERVAL_MS,
  });
  if (waitMs > 0) {
    await sleep(waitMs);
  }
}

export const loadArtistBySpotifyId = internalAction({
  args: {
    spotifyArtistId: v.string(),
  },
  returns: v.union(musicBrainzArtistMatchValidator, v.null()),
  handler: async (ctx, args) => {
    await reserveMusicBrainzRequest(ctx);

    const match = await lookupArtistBySpotifyId(args.spotifyArtistId);
    if (!match) {
      return null;
    }

    await reserveMusicBrainzRequest(ctx);

    const links = await lookupArtistLinksByArtistId(match.artist.id);
    return {
      ...match,
      links,
    };
  },
});

export const loadSpotifyArtistIdByMusicBrainzId = internalAction({
  args: {
    musicBrainzArtistId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await reserveMusicBrainzRequest(ctx);
    return lookupSpotifyArtistIdByMusicBrainzArtistId(args.musicBrainzArtistId);
  },
});
