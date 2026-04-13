import { computeSongDifficulty } from "../../shared/difficulty";
import type { SongSummaryRecord } from "../../shared/leaderboards";

export interface SongSummarySource {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
}

export interface SongSummaryTotals {
  totalPlays: number;
  totalAttempts: number;
  totalWeaknesses: number;
  uniqueUsers: number;
  activeCount: number;
}

export interface SongSummaryDelta {
  totalPlays?: number;
  totalAttempts?: number;
  totalWeaknesses?: number;
  uniqueUsers?: number;
  activeCount?: number;
}

function roundWeaknessRate(totalWeaknesses: number, totalPlays: number) {
  const weaknessRate = totalWeaknesses / Math.max(totalPlays, 1);
  return Math.round(weaknessRate * 100) / 100;
}

export function buildSongSummaryRecord(
  source: SongSummarySource,
  totals: SongSummaryTotals,
): SongSummaryRecord {
  const avgCountRaw = totals.totalPlays / Math.max(totals.totalAttempts, 1);
  const avgCountRounded = Math.round(avgCountRaw);
  const weaknessRate = roundWeaknessRate(
    totals.totalWeaknesses,
    totals.totalPlays,
  );

  return {
    ...source,
    totalPlays: totals.totalPlays,
    totalAttempts: totals.totalAttempts,
    totalWeaknesses: totals.totalWeaknesses,
    avgCountRaw,
    avgCountRounded,
    weaknessRate,
    weaknessFavorability: -weaknessRate,
    difficulty: computeSongDifficulty(source.trackDuration, {
      weaknessRate,
      avgCount: avgCountRaw,
      totalAttempts: totals.totalAttempts,
    }),
    uniqueUsers: totals.uniqueUsers,
    activeCount: totals.activeCount,
  };
}

export function applySongSummaryDelta(
  current: SongSummaryTotals,
  delta: SongSummaryDelta,
): SongSummaryTotals {
  return {
    totalPlays: Math.max(0, current.totalPlays + (delta.totalPlays ?? 0)),
    totalAttempts: Math.max(
      0,
      current.totalAttempts + (delta.totalAttempts ?? 0),
    ),
    totalWeaknesses: Math.max(
      0,
      current.totalWeaknesses + (delta.totalWeaknesses ?? 0),
    ),
    uniqueUsers: Math.max(0, current.uniqueUsers + (delta.uniqueUsers ?? 0)),
    activeCount: Math.max(0, current.activeCount + (delta.activeCount ?? 0)),
  };
}
