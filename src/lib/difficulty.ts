export interface SongStats {
  weaknessRate: number; // weaknesses per play
  avgCount: number; // average plays per streak
  totalAttempts: number;
}

/**
 * Song difficulty based on duration + how much it breaks people.
 * Cold start (< 3 attempts): duration-only estimate.
 */
export function computeSongDifficulty(
  trackDurationMs: number,
  stats?: SongStats,
): number {
  // 4 min = 1.0 baseline, shorter < 1, longer > 1, capped at 2.0
  const durationFactor = Math.min(Math.max(trackDurationMs / 240000, 0.5), 2.0);

  if (!stats || stats.totalAttempts < 3) {
    return durationFactor;
  }

  // How much the song breaks people (0 weakness/play = 1x, 3+ = 4x)
  const brutalityFactor = 1 + Math.min(stats.weaknessRate, 3);

  // Low avg count = hard to endure. avg=1 → 2.0, avg=4 → 0.8, avg=50 → 0.35
  const enduranceFactor = 2 / (1 + Math.log2(Math.max(stats.avgCount, 1)));

  return durationFactor * brutalityFactor * enduranceFactor;
}

/**
 * Weighted streak score for ranking ironmen.
 */
export function computeStreakScore(
  songDifficulty: number,
  count: number,
  hardcore: boolean,
): number {
  return songDifficulty * count * (hardcore ? 1.5 : 1);
}

const LABELS = [
  { threshold: 4, label: "Brutal", color: "text-red-400" },
  { threshold: 2.5, label: "Hard", color: "text-orange-400" },
  { threshold: 1.5, label: "Moderate", color: "text-yellow-400" },
  { threshold: 0.8, label: "Chill", color: "text-green-400" },
  { threshold: 0, label: "Easy", color: "text-emerald-400" },
] as const;

export function difficultyLabel(score: number): {
  label: string;
  color: string;
} {
  for (const l of LABELS) {
    if (score >= l.threshold) return { label: l.label, color: l.color };
  }
  return LABELS[LABELS.length - 1];
}
