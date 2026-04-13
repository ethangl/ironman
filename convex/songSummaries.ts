import type { Id } from "./_generated/dataModel";
import { type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  applySongSummaryDelta,
  buildSongSummaryRecord,
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

async function getSongSummaryDoc(
  ctx: QueryCtx | MutationCtx,
  trackId: string,
) {
  return await ctx.db
    .query("songSummaries")
    .withIndex("by_trackId", (q) => q.eq("trackId", trackId))
    .unique();
}

async function writeSongSummary(
  ctx: MutationCtx,
  existingId: Id<"songSummaries"> | null,
  next: ReturnType<typeof buildSongSummaryRecord>,
) {
  const payload = {
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
  };

  if (existingId) {
    await ctx.db.patch(existingId, payload);
    return;
  }

  await ctx.db.insert("songSummaries", payload);
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
          uniqueUsers: existing.uniqueUsers,
          activeCount: existing.activeCount,
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

  await writeSongSummary(ctx, existing?._id ?? null, next);
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

  await writeSongSummary(ctx, existing?._id ?? null, next);

  return next;
}
