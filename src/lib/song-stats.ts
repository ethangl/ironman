import { computeSongDifficulty } from "@/lib/difficulty";
import type { LeaderboardStreakRecord } from "@/lib/leaderboards";

export interface SongStats {
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
  totalPlays: number;
  totalAttempts: number;
  uniqueUsers: number;
  activeCount: number;
  avgStreak: number;
  weaknessCount: number;
  difficulty: number;
  ironMan: { name: string | null; count: number } | null;
  shameList: Array<{
    userName: string | null;
    count: number;
    startedAt: string;
    endedAt: string;
  }>;
}

export function buildSongStats(
  streaks: Array<
    LeaderboardStreakRecord & {
      endedAtMs?: number;
    }
  >,
): SongStats | null {
  if (streaks.length === 0) return null;

  const sample = streaks[0];
  const totalPlays = streaks.reduce((sum, s) => sum + s.count, 0);
  const totalAttempts = streaks.length;
  const uniqueUsers = new Set(streaks.map((s) => s.userId)).size;
  const activeCount = streaks.filter((s) => s.active).length;
  const avgStreak =
    totalAttempts > 0 ? Math.round(totalPlays / totalAttempts) : 0;

  const best = streaks.reduce(
    (max, s) => (s.count > max.count ? s : max),
    streaks[0],
  );

  const weaknessCount = streaks.reduce((sum, s) => sum + s.weaknessCount, 0);

  const shameList = streaks
    .filter((s) => !s.active && s.endedAtMs != null)
    .sort((a, b) => a.count - b.count)
    .slice(0, 5)
    .map((s) => ({
      userName: s.userName,
      count: s.count,
      startedAt: new Date(s.startedAtMs).toISOString(),
      endedAt: new Date(s.endedAtMs!).toISOString(),
    }));

  const difficulty = computeSongDifficulty(
    sample.trackDuration,
    totalAttempts >= 3
      ? {
          weaknessRate: weaknessCount / Math.max(totalPlays, 1),
          avgCount: totalPlays / totalAttempts,
          totalAttempts,
        }
      : undefined,
  );

  return {
    trackName: sample.trackName,
    trackArtist: sample.trackArtist,
    trackImage: sample.trackImage,
    trackDuration: sample.trackDuration,
    totalPlays,
    totalAttempts,
    uniqueUsers,
    activeCount,
    avgStreak,
    weaknessCount,
    difficulty,
    ironMan:
      best.count > 0 ? { name: best.userName, count: best.count } : null,
    shameList,
  };
}
