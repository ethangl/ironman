import { v } from "convex/values";

import { mutation } from "./_generated/server";
import {
  applySongSummaryDeltaForTrack,
  hasTrackAttemptForUser,
  rebuildSongSummaryForTrack,
} from "./songSummaries";

export const upsert = mutation({
  args: {
    streakId: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
    trackId: v.string(),
    trackName: v.string(),
    trackArtist: v.string(),
    trackImage: v.optional(v.string()),
    trackDuration: v.float64(),
    count: v.float64(),
    active: v.boolean(),
    hardcore: v.boolean(),
    startedAt: v.float64(),
    endedAt: v.optional(v.float64()),
    weaknessCount: v.float64(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("streaks")
      .withIndex("by_streakId", (q) => q.eq("streakId", args.streakId))
      .unique();

    const payload = {
      streakId: args.streakId,
      userId: args.userId,
      userName: args.userName,
      userImage: args.userImage,
      trackId: args.trackId,
      trackName: args.trackName,
      trackArtist: args.trackArtist,
      trackImage: args.trackImage,
      trackDuration: args.trackDuration,
      count: args.count,
      active: args.active,
      hardcore: args.hardcore,
      startedAt: args.startedAt,
      endedAt: args.endedAt,
      weaknessCount: args.weaknessCount,
      lastCompletionArmed: false,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      await rebuildSongSummaryForTrack(ctx, existing.trackId);
      if (existing.trackId !== args.trackId) {
        await rebuildSongSummaryForTrack(ctx, args.trackId);
      }
      return existing._id;
    }

    const isFirstTrackAttempt = !(await hasTrackAttemptForUser(
      ctx,
      args.trackId,
      args.userId,
    ));
    const insertedId = await ctx.db.insert("streaks", payload);
    await applySongSummaryDeltaForTrack(
      ctx,
      {
        trackId: args.trackId,
        trackName: args.trackName,
        trackArtist: args.trackArtist,
        trackImage: args.trackImage ?? null,
        trackDuration: args.trackDuration,
      },
      {
        totalAttempts: 1,
        totalPlays: args.count,
        totalWeaknesses: args.weaknessCount,
        uniqueUsers: isFirstTrackAttempt ? 1 : 0,
        activeCount: args.active ? 1 : 0,
      },
    );

    return insertedId;
  },
});
