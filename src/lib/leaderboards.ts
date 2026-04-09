import { TrackInfo } from "@/types";

import { computeSongDifficulty, computeStreakScore } from "@/lib/difficulty";

export interface LeaderboardEntry {
  rank: number;
  id: string;
  userId?: string;
  count: number;
  active: boolean;
  trackId?: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration?: number;
  userName: string | null;
  userImage: string | null;
  startedAt: string;
  isMe?: boolean;
  weaknessCount?: number;
}

export interface TrackLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
}

export interface IronmenEntry extends TrackInfo {
  rank: number;
  id: string;
  userId: string;
  count: number;
  active: boolean;
  hardcore: boolean;
  userName: string | null;
  userImage: string | null;
  streakScore: number;
  songDifficulty: number;
}

export interface BangerSong extends TrackInfo {
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export interface HellscapeSong extends TrackInfo {
  difficulty: number;
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export interface LeaderboardStreakRecord {
  id: string;
  userId: string;
  count: number;
  active: boolean;
  hardcore: boolean;
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
  startedAtMs: number;
  endedAtMs?: number;
  userName: string | null;
  userImage: string | null;
  weaknessCount: number;
}

type SongAggregate = {
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
  totalPlays: number;
  totalAttempts: number;
  totalWeaknesses: number;
};

function buildSongAggregates(streaks: LeaderboardStreakRecord[]) {
  const byTrack = new Map<string, SongAggregate>();

  for (const streak of streaks) {
    const previous = byTrack.get(streak.trackId);
    if (previous) {
      previous.totalPlays += streak.count;
      previous.totalAttempts += 1;
      previous.totalWeaknesses += streak.weaknessCount;
      continue;
    }

    byTrack.set(streak.trackId, {
      trackName: streak.trackName,
      trackArtist: streak.trackArtist,
      trackImage: streak.trackImage,
      trackDuration: streak.trackDuration,
      totalPlays: streak.count,
      totalAttempts: 1,
      totalWeaknesses: streak.weaknessCount,
    });
  }

  return byTrack;
}

function roundWeaknessRate(totalWeaknesses: number, totalPlays: number) {
  const weaknessRate = totalWeaknesses / Math.max(totalPlays, 1);
  return Math.round(weaknessRate * 100) / 100;
}

function toIsoString(startedAtMs: number) {
  return new Date(startedAtMs).toISOString();
}

export function buildGlobalLeaderboard(streaks: LeaderboardStreakRecord[]) {
  return streaks
    .filter((streak) => streak.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((streak, index) => ({
      rank: index + 1,
      id: streak.id,
      userId: streak.userId,
      count: streak.count,
      active: streak.active,
      trackId: streak.trackId,
      trackName: streak.trackName,
      trackArtist: streak.trackArtist,
      trackImage: streak.trackImage,
      startedAt: toIsoString(streak.startedAtMs),
      userName: streak.userName,
      userImage: streak.userImage,
    })) satisfies LeaderboardEntry[];
}

export function buildTrackLeaderboard(
  streaks: LeaderboardStreakRecord[],
  trackId: string,
  currentUserId?: string | null,
): TrackLeaderboardResponse {
  const deduped = streaks
    .filter((streak) => streak.trackId === trackId)
    .sort((a, b) => b.count - a.count)
    .filter((streak, index, all) => {
      return all.findIndex((candidate) => candidate.userId === streak.userId) === index;
    });

  const leaderboard = deduped.slice(0, 10).map((streak, index) => ({
    rank: index + 1,
    id: streak.id,
    userId: streak.userId,
    count: streak.count,
    active: streak.active,
    startedAt: toIsoString(streak.startedAtMs),
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage,
    userName: streak.userName,
    userImage: streak.userImage,
    isMe: streak.userId === currentUserId,
    weaknessCount: streak.weaknessCount,
  })) satisfies LeaderboardEntry[];

  let myEntry: LeaderboardEntry | null = null;
  if (currentUserId && !leaderboard.some((entry) => entry.isMe)) {
    const myIndex = deduped.findIndex((streak) => streak.userId === currentUserId);
    if (myIndex !== -1 && deduped[myIndex].count > 0) {
      const streak = deduped[myIndex];
      myEntry = {
        rank: myIndex + 1,
        id: streak.id,
        userId: streak.userId,
        count: streak.count,
        active: streak.active,
        startedAt: toIsoString(streak.startedAtMs),
        trackName: streak.trackName,
        trackArtist: streak.trackArtist,
        trackImage: streak.trackImage,
        userName: streak.userName,
        userImage: streak.userImage,
        isMe: true,
        weaknessCount: streak.weaknessCount,
      };
    }
  }

  return { leaderboard, myEntry };
}

export function buildBangersBoard(streaks: LeaderboardStreakRecord[]) {
  return Array.from(buildSongAggregates(streaks).entries())
    .map(([trackId, aggregate]) => {
      const avgCount = aggregate.totalPlays / aggregate.totalAttempts;
      return {
        trackId,
        trackName: aggregate.trackName,
        trackArtist: aggregate.trackArtist,
        trackImage: aggregate.trackImage,
        trackDuration: aggregate.trackDuration,
        totalAttempts: aggregate.totalAttempts,
        avgCount: Math.round(avgCount),
        weaknessRate: roundWeaknessRate(
          aggregate.totalWeaknesses,
          aggregate.totalPlays,
        ),
      };
    })
    .sort((a, b) => b.avgCount - a.avgCount || a.weaknessRate - b.weaknessRate)
    .slice(0, 20) satisfies BangerSong[];
}

export function buildHellscapeBoard(streaks: LeaderboardStreakRecord[]) {
  return Array.from(buildSongAggregates(streaks).entries())
    .map(([trackId, aggregate]) => {
      const avgCount = aggregate.totalPlays / aggregate.totalAttempts;
      const weaknessRate = roundWeaknessRate(
        aggregate.totalWeaknesses,
        aggregate.totalPlays,
      );
      return {
        trackId,
        trackName: aggregate.trackName,
        trackArtist: aggregate.trackArtist,
        trackImage: aggregate.trackImage,
        trackDuration: aggregate.trackDuration,
        difficulty: computeSongDifficulty(aggregate.trackDuration, {
          weaknessRate,
          avgCount,
          totalAttempts: aggregate.totalAttempts,
        }),
        totalAttempts: aggregate.totalAttempts,
        avgCount: Math.round(avgCount),
        weaknessRate,
      };
    })
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 20) satisfies HellscapeSong[];
}

export function buildIronmenBoard(streaks: LeaderboardStreakRecord[]) {
  const songStats = buildSongAggregates(streaks);

  return streaks
    .filter((streak) => streak.count >= 3)
    .map((streak) => {
      const stats = songStats.get(streak.trackId)!;
      const songDifficulty = computeSongDifficulty(
        stats.trackDuration,
        stats.totalAttempts >= 3
          ? {
              weaknessRate: stats.totalWeaknesses / Math.max(stats.totalPlays, 1),
              avgCount: stats.totalPlays / stats.totalAttempts,
              totalAttempts: stats.totalAttempts,
            }
          : undefined,
      );
      const streakScore = computeStreakScore(
        songDifficulty,
        streak.count,
        streak.hardcore,
      );

      return {
        rank: 0,
        id: streak.id,
        userId: streak.userId,
        count: streak.count,
        active: streak.active,
        hardcore: streak.hardcore,
        trackId: streak.trackId,
        trackName: streak.trackName,
        trackArtist: streak.trackArtist,
        trackImage: streak.trackImage,
        trackDuration: streak.trackDuration,
        userName: streak.userName,
        userImage: streak.userImage,
        streakScore: Math.round(streakScore * 10) / 10,
        songDifficulty: Math.round(songDifficulty * 10) / 10,
      };
    })
    .sort((a, b) => b.streakScore - a.streakScore)
    .slice(0, 20)
    .map((streak, index) => ({
      ...streak,
      rank: index + 1,
    })) satisfies IronmenEntry[];
}
