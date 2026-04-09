import { v } from "convex/values";

import {
  buildBangersBoard,
  buildGlobalLeaderboard,
  buildHellscapeBoard,
  buildIronmenBoard,
  buildTrackLeaderboard,
  type LeaderboardStreakRecord,
} from "../src/lib/leaderboards";
import type { Doc } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";

function toLeaderboardStreak(
  streak: Doc<"streaks">,
): LeaderboardStreakRecord {
  return {
    id: streak.streakId,
    userId: streak.userId,
    count: streak.count,
    active: streak.active,
    hardcore: streak.hardcore,
    trackId: streak.trackId,
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage ?? null,
    trackDuration: streak.trackDuration,
    startedAtMs: streak.startedAt,
    userName: streak.userName ?? null,
    userImage: streak.userImage ?? null,
    weaknessCount: streak.weaknessCount,
  };
}

async function listAllStreaks(ctx: QueryCtx) {
  const streaks = await ctx.db.query("streaks").collect();
  return streaks.map(toLeaderboardStreak);
}

export const global = query({
  args: {},
  handler: async (ctx) => {
    const streaks = await ctx.db
      .query("streaks")
      .withIndex("by_count", (q) => q.gte("count", 3))
      .order("desc")
      .take(20);

    return buildGlobalLeaderboard(streaks.map(toLeaderboardStreak));
  },
});

export const track = query({
  args: {
    trackId: v.string(),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const streaks = await ctx.db
      .query("streaks")
      .withIndex("by_trackId", (q) => q.eq("trackId", args.trackId))
      .collect();

    return buildTrackLeaderboard(
      streaks.map(toLeaderboardStreak),
      args.trackId,
      args.currentUserId,
    );
  },
});

export const ironmen = query({
  args: {},
  handler: async (ctx) => {
    return buildIronmenBoard(await listAllStreaks(ctx));
  },
});

export const bangers = query({
  args: {},
  handler: async (ctx) => {
    return buildBangersBoard(await listAllStreaks(ctx));
  },
});

export const hellscape = query({
  args: {},
  handler: async (ctx) => {
    return buildHellscapeBoard(await listAllStreaks(ctx));
  },
});
