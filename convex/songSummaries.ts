import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
  internalQuery,
  internalMutation,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  applySongSummaryDelta,
  buildSongSummaryRecord,
  SONG_SUMMARY_BACKFILL_NAME,
  type SongSummaryDelta,
  type SongSummarySource,
} from "./lib/songSummaries";

function toSongSummarySource(streak: {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage?: string | null;
  trackDuration: number;
}): SongSummarySource {
  return {
    trackId: streak.trackId,
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage ?? null,
    trackDuration: streak.trackDuration,
  };
}

async function getBackfillDoc(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query("backfills")
    .withIndex("by_name", (q) => q.eq("name", SONG_SUMMARY_BACKFILL_NAME))
    .unique();
}

async function getSongSummaryDoc(
  ctx: QueryCtx | MutationCtx,
  trackId: string,
) {
  return await ctx.db
    .query("songSummaries")
    .withIndex("by_trackId", (q) => q.eq("trackId", trackId))
    .unique();
}

export async function hasTrackAttemptForUser(
  ctx: QueryCtx | MutationCtx,
  trackId: string,
  userId: string,
) {
  const existing = await ctx.db
    .query("streaks")
    .withIndex("by_trackId_and_userId", (q) =>
      q.eq("trackId", trackId).eq("userId", userId),
    )
    .take(1);

  return existing.length > 0;
}

async function upsertBackfillDoc(
  ctx: MutationCtx,
  patch: {
    status: "running" | "complete";
    cursor?: string;
    completedAt?: number;
  },
) {
  const existing = await getBackfillDoc(ctx);
  const next = {
    name: SONG_SUMMARY_BACKFILL_NAME,
    status: patch.status,
    cursor: patch.cursor,
    updatedAt: Date.now(),
    completedAt: patch.completedAt,
  };

  if (existing) {
    await ctx.db.patch(existing._id, next);
    return;
  }

  await ctx.db.insert("backfills", next);
}

export async function isSongSummaryBackfillComplete(
  ctx: QueryCtx | MutationCtx,
) {
  return (await getBackfillDoc(ctx))?.status === "complete";
}

export const getBackfillStatus = internalQuery({
  args: {},
  handler: async (ctx) => {
    const backfill = await getBackfillDoc(ctx);

    return (
      backfill ?? {
        name: SONG_SUMMARY_BACKFILL_NAME,
        status: "not_started",
      }
    );
  },
});

export async function applySongSummaryDeltaForTrack(
  ctx: MutationCtx,
  source: SongSummarySource,
  delta: SongSummaryDelta,
) {
  const existing = await getSongSummaryDoc(ctx, source.trackId);
  const nextTotals = applySongSummaryDelta(
    existing
      ? {
          totalPlays: existing.totalPlays,
          totalAttempts: existing.totalAttempts,
          totalWeaknesses: existing.totalWeaknesses,
          uniqueUsers: existing.uniqueUsers ?? 0,
          activeCount: existing.activeCount ?? 0,
        }
      : {
          totalPlays: 0,
          totalAttempts: 0,
          totalWeaknesses: 0,
          uniqueUsers: 0,
          activeCount: 0,
        },
    delta,
  );
  const next = buildSongSummaryRecord(source, nextTotals);

  if (existing) {
    await ctx.db.patch(existing._id, {
      trackName: next.trackName,
      trackArtist: next.trackArtist,
      trackImage: next.trackImage ?? undefined,
      trackDuration: next.trackDuration,
      totalPlays: next.totalPlays,
      totalAttempts: next.totalAttempts,
      totalWeaknesses: next.totalWeaknesses,
      avgCountRaw: next.avgCountRaw,
      avgCountRounded: next.avgCountRounded,
      weaknessRate: next.weaknessRate,
      weaknessFavorability: next.weaknessFavorability,
      difficulty: next.difficulty,
      uniqueUsers: next.uniqueUsers,
      activeCount: next.activeCount,
    });
    return;
  }

  await ctx.db.insert("songSummaries", {
    trackId: next.trackId,
    trackName: next.trackName,
    trackArtist: next.trackArtist,
    trackImage: next.trackImage ?? undefined,
    trackDuration: next.trackDuration,
    totalPlays: next.totalPlays,
    totalAttempts: next.totalAttempts,
    totalWeaknesses: next.totalWeaknesses,
    avgCountRaw: next.avgCountRaw,
    avgCountRounded: next.avgCountRounded,
    weaknessRate: next.weaknessRate,
    weaknessFavorability: next.weaknessFavorability,
    difficulty: next.difficulty,
    uniqueUsers: next.uniqueUsers,
    activeCount: next.activeCount,
  });
}

export async function rebuildSongSummaryForTrack(
  ctx: MutationCtx,
  trackId: string,
) {
  const streaks = await ctx.db
    .query("streaks")
    .withIndex("by_trackId", (q) => q.eq("trackId", trackId))
    .collect();
  const existing = await getSongSummaryDoc(ctx, trackId);

  if (streaks.length === 0) {
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  }

  const latestStreak = streaks.reduce((latest, streak) =>
    streak.startedAt > latest.startedAt ? streak : latest,
  );
  const next = buildSongSummaryRecord(toSongSummarySource(latestStreak), {
    totalPlays: streaks.reduce((sum, streak) => sum + streak.count, 0),
    totalAttempts: streaks.length,
    totalWeaknesses: streaks.reduce(
      (sum, streak) => sum + streak.weaknessCount,
      0,
    ),
    uniqueUsers: new Set(streaks.map((streak) => streak.userId)).size,
    activeCount: streaks.filter((streak) => streak.active).length,
  });

  if (existing) {
    await ctx.db.patch(existing._id, {
      trackName: next.trackName,
      trackArtist: next.trackArtist,
      trackImage: next.trackImage ?? undefined,
      trackDuration: next.trackDuration,
      totalPlays: next.totalPlays,
      totalAttempts: next.totalAttempts,
      totalWeaknesses: next.totalWeaknesses,
      avgCountRaw: next.avgCountRaw,
      avgCountRounded: next.avgCountRounded,
      weaknessRate: next.weaknessRate,
      weaknessFavorability: next.weaknessFavorability,
      difficulty: next.difficulty,
      uniqueUsers: next.uniqueUsers,
      activeCount: next.activeCount,
    });
    return next;
  }

  await ctx.db.insert("songSummaries", {
    trackId: next.trackId,
    trackName: next.trackName,
    trackArtist: next.trackArtist,
    trackImage: next.trackImage ?? undefined,
    trackDuration: next.trackDuration,
    totalPlays: next.totalPlays,
    totalAttempts: next.totalAttempts,
    totalWeaknesses: next.totalWeaknesses,
    avgCountRaw: next.avgCountRaw,
    avgCountRounded: next.avgCountRounded,
    weaknessRate: next.weaknessRate,
    weaknessFavorability: next.weaknessFavorability,
    difficulty: next.difficulty,
    uniqueUsers: next.uniqueUsers,
    activeCount: next.activeCount,
  });

  return next;
}

export const startBackfill = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const backfill = await getBackfillDoc(ctx);

    if (backfill?.status === "running") {
      return { started: false, status: "running" as const };
    }

    await upsertBackfillDoc(ctx, {
      status: "running",
    });
    await ctx.scheduler.runAfter(0, internal.songSummaries.backfillBatch, {
      batchSize: args.batchSize,
    });

    return { started: true, status: "running" as const };
  },
});

export const backfillBatch = internalMutation({
  args: {
    cursor: v.optional(v.string()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("streaks")
      .withIndex("by_trackId")
      .paginate({
        cursor: args.cursor ?? null,
        numItems: args.batchSize ?? 100,
      });

    const trackIds = [...new Set(page.page.map((streak) => streak.trackId))];
    for (const trackId of trackIds) {
      await rebuildSongSummaryForTrack(ctx, trackId);
    }

    if (page.isDone) {
      await upsertBackfillDoc(ctx, {
        status: "complete",
        completedAt: Date.now(),
      });

      return {
        processedTrackIds: trackIds.length,
        status: "complete" as const,
      };
    }

    await upsertBackfillDoc(ctx, {
      status: "running",
      cursor: page.continueCursor,
    });
    await ctx.scheduler.runAfter(0, internal.songSummaries.backfillBatch, {
      cursor: page.continueCursor,
      batchSize: args.batchSize,
    });

    return {
      processedTrackIds: trackIds.length,
      status: "running" as const,
      cursor: page.continueCursor,
    };
  },
});
