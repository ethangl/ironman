export interface SongDifficultyStats {
  weaknessRate: number;
  avgCount: number;
  totalAttempts: number;
}

export function computeSongDifficulty(
  trackDurationMs: number,
  stats?: SongDifficultyStats,
): number {
  const durationFactor = Math.min(Math.max(trackDurationMs / 240000, 0.5), 2.0);

  if (!stats || stats.totalAttempts < 3) {
    return durationFactor;
  }

  const brutalityFactor = 1 + Math.min(stats.weaknessRate, 3);
  const enduranceFactor = 2 / (1 + Math.log2(Math.max(stats.avgCount, 1)));

  return durationFactor * brutalityFactor * enduranceFactor;
}

export function computeStreakScore(
  songDifficulty: number,
  count: number,
  hardcore: boolean,
): number {
  return songDifficulty * count * (hardcore ? 1.5 : 1);
}
