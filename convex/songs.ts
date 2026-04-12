import { v } from "convex/values";

import {
  buildSongStats,
  buildSongStatsFromSummary,
} from "../shared/song-stats";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { isSongSummaryBackfillComplete } from "./songSummaries";

function toSongStatsRecord(streak: Doc<"streaks">) {
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
    endedAtMs: streak.endedAt ?? undefined,
    userName: streak.userName ?? null,
    userImage: streak.userImage ?? null,
    weaknessCount: streak.weaknessCount,
  };
}

function toSongSummaryStats(summary: Doc<"songSummaries">) {
  return {
    trackName: summary.trackName,
    trackArtist: summary.trackArtist,
    trackImage: summary.trackImage ?? null,
    trackDuration: summary.trackDuration,
    totalPlays: summary.totalPlays,
    totalAttempts: summary.totalAttempts,
    uniqueUsers: summary.uniqueUsers!,
    activeCount: summary.activeCount!,
    avgStreak: summary.avgCountRounded,
    weaknessCount: summary.totalWeaknesses,
    difficulty: summary.difficulty,
  };
}

export const get = query({
  args: {
    trackId: v.string(),
  },
  handler: async (ctx, args) => {
    if (await isSongSummaryBackfillComplete(ctx)) {
      const summary = await ctx.db
        .query("songSummaries")
        .withIndex("by_trackId", (q) => q.eq("trackId", args.trackId))
        .unique();

      if (summary) {
        const topStreak = await ctx.db
          .query("streaks")
          .withIndex("by_trackId_and_count", (q) => q.eq("trackId", args.trackId))
          .order("desc")
          .take(1);
        const shameList: Array<{
          userName: string | null;
          count: number;
          startedAtMs: number;
          endedAtMs: number;
        }> = [];

        for await (const streak of ctx.db
          .query("streaks")
          .withIndex("by_trackId_and_count", (q) => q.eq("trackId", args.trackId))) {
          if (streak.active || typeof streak.endedAt !== "number") {
            continue;
          }

          shameList.push({
            userName: streak.userName ?? null,
            count: streak.count,
            startedAtMs: streak.startedAt,
            endedAtMs: streak.endedAt,
          });

          if (shameList.length >= 5) {
            break;
          }
        }

        if (
          typeof summary.uniqueUsers === "number" &&
          typeof summary.activeCount === "number"
        ) {
          return buildSongStatsFromSummary(
            toSongSummaryStats(summary),
            topStreak[0]
              ? {
                  userName: topStreak[0].userName ?? null,
                  count: topStreak[0].count,
                }
              : null,
            shameList,
          );
        }
      }
    }

    const streaks = await ctx.db
      .query("streaks")
      .withIndex("by_trackId", (q) => q.eq("trackId", args.trackId))
      .collect();

    return buildSongStats(streaks.map(toSongStatsRecord));
  },
});
