import { v } from "convex/values";

import { buildSongStats } from "../src/lib/song-stats";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

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

export const get = query({
  args: {
    trackId: v.string(),
  },
  handler: async (ctx, args) => {
    const streaks = await ctx.db
      .query("streaks")
      .withIndex("by_trackId", (q) => q.eq("trackId", args.trackId))
      .collect();

    return buildSongStats(streaks.map(toSongStatsRecord));
  },
});
