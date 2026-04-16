import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { authComponent } from "./betterAuth";
import {
  normalizeTrackAudioFeaturesResponse,
  uniqueTrackIds,
} from "./lib/reccobeats";

const RECCOBEATS_AUDIO_FEATURES_URL =
  "https://api.reccobeats.com/v1/audio-features";

const trackAudioFeaturesRecordValidator = v.object({
  spotifyTrackId: v.string(),
  isrc: v.optional(v.string()),
  acousticness: v.number(),
  danceability: v.number(),
  energy: v.number(),
  instrumentalness: v.number(),
  key: v.number(),
  liveness: v.number(),
  loudness: v.number(),
  mode: v.number(),
  speechiness: v.number(),
  tempo: v.number(),
  valence: v.number(),
  fetchedAt: v.number(),
});

async function requireAuthUser(ctx: unknown) {
  const user = await authComponent.getAuthUser(
    ctx as Parameters<typeof authComponent.getAuthUser>[0],
  );
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function fetchTrackAudioFeatures(trackIds: string[]) {
  const url = new URL(RECCOBEATS_AUDIO_FEATURES_URL);
  url.searchParams.set("ids", trackIds.join(","));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `ReccoBeats audio features request failed with status ${response.status}.`,
    );
  }

  return response.json();
}

export const getExistingTrackIds = internalQuery({
  args: {
    trackIds: v.array(v.string()),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const trackIds = uniqueTrackIds(args.trackIds);
    const existingTrackIds: string[] = [];

    for (const trackId of trackIds) {
      const existing = await ctx.db
        .query("trackAudioFeatures")
        .withIndex("by_spotifyTrackId", (q) => q.eq("spotifyTrackId", trackId))
        .unique();

      if (existing) {
        existingTrackIds.push(trackId);
      }
    }

    return existingTrackIds;
  },
});

export const upsertTrackAudioFeatures = internalMutation({
  args: {
    records: v.array(trackAudioFeaturesRecordValidator),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let upsertedCount = 0;

    for (const record of args.records) {
      const existing = await ctx.db
        .query("trackAudioFeatures")
        .withIndex("by_spotifyTrackId", (q) =>
          q.eq("spotifyTrackId", record.spotifyTrackId),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, record);
      } else {
        await ctx.db.insert("trackAudioFeatures", record);
      }

      upsertedCount += 1;
    }

    return upsertedCount;
  },
});

export const ensureTrackAudioFeatures = action({
  args: {
    trackIds: v.array(v.string()),
  },
  returns: v.object({
    requestedCount: v.number(),
    cachedCount: v.number(),
    fetchedCount: v.number(),
    missingCount: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireAuthUser(ctx);

    const requestedTrackIds = uniqueTrackIds(args.trackIds);
    if (requestedTrackIds.length === 0) {
      return {
        requestedCount: 0,
        cachedCount: 0,
        fetchedCount: 0,
        missingCount: 0,
      };
    }

    const existingTrackIds: string[] = await ctx.runQuery(
      internal.reccobeats.getExistingTrackIds,
      { trackIds: requestedTrackIds },
    );
    const existingTrackIdSet = new Set(existingTrackIds);
    const uncachedTrackIds = requestedTrackIds.filter(
      (trackId) => !existingTrackIdSet.has(trackId),
    );

    if (uncachedTrackIds.length === 0) {
      return {
        requestedCount: requestedTrackIds.length,
        cachedCount: existingTrackIds.length,
        fetchedCount: 0,
        missingCount: 0,
      };
    }

    const response = await fetchTrackAudioFeatures(uncachedTrackIds);
    const { records, missingTrackIds } = normalizeTrackAudioFeaturesResponse({
      requestedTrackIds: uncachedTrackIds,
      response,
      fetchedAt: Date.now(),
    });

    if (records.length > 0) {
      await ctx.runMutation(internal.reccobeats.upsertTrackAudioFeatures, {
        records,
      });
    }

    return {
      requestedCount: requestedTrackIds.length,
      cachedCount: existingTrackIds.length,
      fetchedCount: records.length,
      missingCount: missingTrackIds.length,
    };
  },
});
