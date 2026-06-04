import { v } from "convex/values";

import {
  lookupArtistByMusicBrainzId,
  lookupArtistByName,
  type LastFmArtistMatch,
} from "./client";
import { api } from "./_generated/api";
import { internalAction, type ActionCtx } from "./_generated/server";
import { lastFmArtistMatchValidator } from "./validators";

const LASTFM_REQUEST_INTERVAL_MS = 350;
const LASTFM_SCHEDULER_KEY = "artist-lookup";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reserveLastFmRequest(ctx: ActionCtx) {
  const waitMs = await ctx.runMutation(api.scheduler.reserve, {
    key: LASTFM_SCHEDULER_KEY,
    intervalMs: LASTFM_REQUEST_INTERVAL_MS,
  });
  if (waitMs > 0) {
    await sleep(waitMs);
  }
}

export const loadArtistDetails = internalAction({
  args: {
    apiKey: v.string(),
    artistName: v.union(v.string(), v.null()),
    musicBrainzId: v.union(v.string(), v.null()),
  },
  returns: v.union(lastFmArtistMatchValidator, v.null()),
  handler: async (ctx, args) => {
    let match: LastFmArtistMatch | null = null;

    await reserveLastFmRequest(ctx);

    if (args.musicBrainzId) {
      match = await lookupArtistByMusicBrainzId(args.apiKey, args.musicBrainzId);
    }

    if (!match && args.artistName) {
      match = await lookupArtistByName(args.apiKey, args.artistName);
    }

    return match;
  },
});
