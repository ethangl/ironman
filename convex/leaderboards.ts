import { v } from "convex/values";

import {
  buildBangersBoardFromSongSummaries,
  buildGlobalLeaderboard,
  buildHellscapeBoardFromSongSummaries,
  buildIronmenBoardFromSongSummaries,
  buildTrackLeaderboardFromSortedBestStreaks,
  type HomeLeaderboardsResponse,
  type LeaderboardStreakRecord,
  type SongSummaryRecord,
} from "../shared/leaderboards";
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

function toSongSummary(
  summary: Doc<"songSummaries">,
): SongSummaryRecord {
  return {
    trackId: summary.trackId,
    trackName: summary.trackName,
    trackArtist: summary.trackArtist,
    trackImage: summary.trackImage ?? null,
    trackDuration: summary.trackDuration,
    totalPlays: summary.totalPlays,
    totalAttempts: summary.totalAttempts,
    totalWeaknesses: summary.totalWeaknesses,
    avgCountRaw: summary.avgCountRaw,
    avgCountRounded: summary.avgCountRounded,
    weaknessRate: summary.weaknessRate,
    weaknessFavorability: summary.weaknessFavorability,
    difficulty: summary.difficulty,
    uniqueUsers: summary.uniqueUsers,
    activeCount: summary.activeCount,
  };
}

async function getTopGlobalStreaks(ctx: QueryCtx) {
  const streaks = await ctx.db
    .query("streaks")
    .withIndex("by_count", (q) => q.gte("count", 3))
    .order("desc")
    .take(20);

  return buildGlobalLeaderboard(streaks.map(toLeaderboardStreak));
}

async function getTopBangersFromSummaries(ctx: QueryCtx) {
  const summaries = await ctx.db
    .query("songSummaries")
    .withIndex("by_avgCountRounded_and_weaknessFavorability")
    .order("desc")
    .take(20);

  return buildBangersBoardFromSongSummaries(summaries.map(toSongSummary));
}

async function getTopHellscapeFromSummaries(ctx: QueryCtx) {
  const summaries = await ctx.db
    .query("songSummaries")
    .withIndex("by_difficulty")
    .order("desc")
    .take(20);

  return buildHellscapeBoardFromSongSummaries(summaries.map(toSongSummary));
}

async function getIronmenFromSummaries(ctx: QueryCtx) {
  const streaks: LeaderboardStreakRecord[] = [];
  const songSummariesByTrack = new Map<string, SongSummaryRecord>();

  for await (const streak of ctx.db
    .query("streaks")
    .withIndex("by_count", (q) => q.gte("count", 3))
    .order("desc")) {
    streaks.push(toLeaderboardStreak(streak));

    if (songSummariesByTrack.has(streak.trackId)) {
      continue;
    }

    const summary = await ctx.db
      .query("songSummaries")
      .withIndex("by_trackId", (q) => q.eq("trackId", streak.trackId))
      .unique();

    if (!summary) {
      continue;
    }

    songSummariesByTrack.set(streak.trackId, toSongSummary(summary));
  }

  return buildIronmenBoardFromSongSummaries(streaks, songSummariesByTrack);
}

export const global = query({
  args: {},
  handler: async (ctx) => {
    return getTopGlobalStreaks(ctx);
  },
});

export const track = query({
  args: {
    trackId: v.string(),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rankedBestStreaks: LeaderboardStreakRecord[] = [];
    const seenUsers = new Set<string>();

    const streaks = ctx.db
      .query("streaks")
      .withIndex("by_trackId_and_count", (q) => q.eq("trackId", args.trackId))
      .order("desc");

    for await (const streak of streaks) {
      if (seenUsers.has(streak.userId)) continue;

      seenUsers.add(streak.userId);
      rankedBestStreaks.push(toLeaderboardStreak(streak));

      if (
        rankedBestStreaks.length >= 10 &&
        (!args.currentUserId || seenUsers.has(args.currentUserId))
      ) {
        break;
      }
    }

    return buildTrackLeaderboardFromSortedBestStreaks(
      rankedBestStreaks,
      args.currentUserId,
    );
  },
});

export const home = query({
  args: {},
  handler: async (ctx) =>
    ({
      global: await getTopGlobalStreaks(ctx),
      ironmen: await getIronmenFromSummaries(ctx),
      bangers: await getTopBangersFromSummaries(ctx),
      hellscape: await getTopHellscapeFromSummaries(ctx),
    }) satisfies HomeLeaderboardsResponse,
});

export const ironmen = query({
  args: {},
  handler: async (ctx) => getIronmenFromSummaries(ctx),
});

export const bangers = query({
  args: {},
  handler: async (ctx) => getTopBangersFromSummaries(ctx),
});

export const hellscape = query({
  args: {},
  handler: async (ctx) => getTopHellscapeFromSummaries(ctx),
});
