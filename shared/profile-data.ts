import type { LeaderboardStreakRecord } from "./leaderboards";

export interface ProfileData {
  user: { id: string; name: string; image: string | null };
  stats: {
    totalPlays: number;
    totalStreaks: number;
    uniqueSongs: number;
    weaknessCount: number;
  };
  bestStreak: {
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    trackId: string;
    count: number;
  } | null;
  activeStreak: {
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    trackId: string;
    count: number;
  } | null;
  history: {
    id: string;
    trackId: string;
    trackName: string;
    trackArtist: string;
    trackImage: string | null;
    count: number;
    active: boolean;
    startedAt: string;
    endedAt: string | null;
  }[];
}

export interface ProfileUserRecord {
  id: string;
  name: string;
  image: string | null;
}

export function buildProfileData(
  user: ProfileUserRecord,
  streaks: LeaderboardStreakRecord[],
): ProfileData {
  const visibleStreaks = [...streaks]
    .filter((streak) => streak.count > 1)
    .sort((a, b) => b.count - a.count);

  return buildProfileDataFromVisibleSortedStreaks(user, visibleStreaks);
}

export function buildProfileDataFromVisibleSortedStreaks(
  user: ProfileUserRecord,
  visibleStreaks: LeaderboardStreakRecord[],
): ProfileData {

  const totalPlays = visibleStreaks.reduce((sum, streak) => sum + streak.count, 0);
  const totalStreaks = visibleStreaks.length;
  const bestStreak = visibleStreaks[0] ?? null;
  const activeStreak = visibleStreaks.find((streak) => streak.active) ?? null;
  const uniqueSongs = new Set(visibleStreaks.map((streak) => streak.trackId)).size;
  const weaknessCount = visibleStreaks.reduce(
    (sum, streak) => sum + streak.weaknessCount,
    0,
  );

  return {
    user,
    stats: {
      totalPlays,
      totalStreaks,
      uniqueSongs,
      weaknessCount,
    },
    bestStreak: bestStreak
      ? {
          trackName: bestStreak.trackName,
          trackArtist: bestStreak.trackArtist,
          trackImage: bestStreak.trackImage,
          trackId: bestStreak.trackId,
          count: bestStreak.count,
        }
      : null,
    activeStreak: activeStreak
      ? {
          trackName: activeStreak.trackName,
          trackArtist: activeStreak.trackArtist,
          trackImage: activeStreak.trackImage,
          trackId: activeStreak.trackId,
          count: activeStreak.count,
        }
      : null,
    history: visibleStreaks.map((streak) => ({
      id: streak.id,
      trackId: streak.trackId,
      trackName: streak.trackName,
      trackArtist: streak.trackArtist,
      trackImage: streak.trackImage,
      count: streak.count,
      active: streak.active,
      startedAt: new Date(streak.startedAtMs).toISOString(),
      endedAt:
        typeof streak.endedAtMs === "number"
          ? new Date(streak.endedAtMs).toISOString()
          : null,
    })),
  };
}
