import type { TrackSnapshot } from "./track";

import { computeSongDifficulty, computeStreakScore } from "./difficulty";

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

export interface HomeLeaderboardsResponse {
  global: LeaderboardEntry[];
  ironmen: IronmenEntry[];
  bangers: BangerSong[];
  hellscape: HellscapeSong[];
}

export interface IronmenEntry extends TrackSnapshot {
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

export interface BangerSong extends TrackSnapshot {
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export interface HellscapeSong extends TrackSnapshot {
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

export interface SongSummaryRecord extends TrackSnapshot {
  totalPlays: number;
  totalAttempts: number;
  totalWeaknesses: number;
  avgCountRaw: number;
  avgCountRounded: number;
  weaknessRate: number;
  weaknessFavorability: number;
  difficulty: number;
  uniqueUsers: number;
  activeCount: number;
}

type SongAggregate = {
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
  totalPlays: number;
  totalAttempts: number;
  totalWeaknesses: number;
  uniqueUsers: Set<string>;
  activeCount: number;
};

function buildSongAggregates(streaks: LeaderboardStreakRecord[]) {
  const byTrack = new Map<string, SongAggregate>();

  for (const streak of streaks) {
    const previous = byTrack.get(streak.trackId);
    if (previous) {
      previous.totalPlays += streak.count;
      previous.totalAttempts += 1;
      previous.totalWeaknesses += streak.weaknessCount;
      previous.uniqueUsers.add(streak.userId);
      if (streak.active) {
        previous.activeCount += 1;
      }
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
      uniqueUsers: new Set([streak.userId]),
      activeCount: streak.active ? 1 : 0,
    });
  }

  return byTrack;
}

function roundWeaknessRate(totalWeaknesses: number, totalPlays: number) {
  const weaknessRate = totalWeaknesses / Math.max(totalPlays, 1);
  return Math.round(weaknessRate * 100) / 100;
}

function toSongSummaryRecord(
  trackId: string,
  aggregate: SongAggregate,
): SongSummaryRecord {
  const avgCountRaw = aggregate.totalPlays / Math.max(aggregate.totalAttempts, 1);
  const avgCountRounded = Math.round(avgCountRaw);
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
    totalPlays: aggregate.totalPlays,
    totalAttempts: aggregate.totalAttempts,
    totalWeaknesses: aggregate.totalWeaknesses,
    avgCountRaw,
    avgCountRounded,
    weaknessRate,
    weaknessFavorability: -weaknessRate,
    difficulty: computeSongDifficulty(aggregate.trackDuration, {
      weaknessRate,
      avgCount: avgCountRaw,
      totalAttempts: aggregate.totalAttempts,
    }),
    uniqueUsers: aggregate.uniqueUsers.size,
    activeCount: aggregate.activeCount,
  };
}

function toBangerSong(summary: SongSummaryRecord): BangerSong {
  return {
    trackId: summary.trackId,
    trackName: summary.trackName,
    trackArtist: summary.trackArtist,
    trackImage: summary.trackImage,
    trackDuration: summary.trackDuration,
    totalAttempts: summary.totalAttempts,
    avgCount: summary.avgCountRounded,
    weaknessRate: summary.weaknessRate,
  };
}

function toHellscapeSong(summary: SongSummaryRecord): HellscapeSong {
  return {
    trackId: summary.trackId,
    trackName: summary.trackName,
    trackArtist: summary.trackArtist,
    trackImage: summary.trackImage,
    trackDuration: summary.trackDuration,
    difficulty: summary.difficulty,
    totalAttempts: summary.totalAttempts,
    avgCount: summary.avgCountRounded,
    weaknessRate: summary.weaknessRate,
  };
}

function toIronmenEntry(
  streak: LeaderboardStreakRecord,
  songDifficulty: number,
): IronmenEntry {
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
    .filter(
      (streak, index, all) =>
        all.findIndex((candidate) => candidate.userId === streak.userId) ===
        index,
    );

  return buildTrackLeaderboardFromSortedBestStreaks(deduped, currentUserId);
}

export function buildTrackLeaderboardFromSortedBestStreaks(
  streaks: LeaderboardStreakRecord[],
  currentUserId?: string | null,
): TrackLeaderboardResponse {
  const leaderboard = streaks.slice(0, 10).map((streak, index) => ({
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
    const myIndex = streaks.findIndex((streak) => streak.userId === currentUserId);
    if (myIndex !== -1 && streaks[myIndex].count > 0) {
      const streak = streaks[myIndex];
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
    .map(([trackId, aggregate]) => toSongSummaryRecord(trackId, aggregate))
    .sort(
      (a, b) =>
        b.avgCountRounded - a.avgCountRounded ||
        a.weaknessRate - b.weaknessRate,
    )
    .slice(0, 20)
    .map(toBangerSong) satisfies BangerSong[];
}

export function buildHellscapeBoard(streaks: LeaderboardStreakRecord[]) {
  return Array.from(buildSongAggregates(streaks).entries())
    .map(([trackId, aggregate]) => toSongSummaryRecord(trackId, aggregate))
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 20)
    .map(toHellscapeSong) satisfies HellscapeSong[];
}

export function buildIronmenBoard(streaks: LeaderboardStreakRecord[]) {
  const songStats = buildSongAggregates(streaks);

  return streaks
    .filter((streak) => streak.count >= 3)
    .map((streak) => {
      const stats = songStats.get(streak.trackId)!;
      return toIronmenEntry(
        streak,
        toSongSummaryRecord(streak.trackId, stats).difficulty,
      );
    })
    .sort((a, b) => b.streakScore - a.streakScore)
    .slice(0, 20)
    .map((streak, index) => ({
      ...streak,
      rank: index + 1,
    })) satisfies IronmenEntry[];
}

export function buildSongSummaryRecords(streaks: LeaderboardStreakRecord[]) {
  return Array.from(buildSongAggregates(streaks).entries()).map(
    ([trackId, aggregate]) => toSongSummaryRecord(trackId, aggregate),
  );
}

export function buildBangersBoardFromSongSummaries(
  summaries: SongSummaryRecord[],
) {
  return summaries.slice(0, 20).map(toBangerSong) satisfies BangerSong[];
}

export function buildHellscapeBoardFromSongSummaries(
  summaries: SongSummaryRecord[],
) {
  return summaries.slice(0, 20).map(toHellscapeSong) satisfies HellscapeSong[];
}

export function buildIronmenBoardFromSongSummaries(
  streaks: LeaderboardStreakRecord[],
  songSummaries: ReadonlyMap<string, SongSummaryRecord>,
) {
  return streaks
    .filter((streak) => streak.count >= 3)
    .map((streak) =>
      toIronmenEntry(
        streak,
        songSummaries.get(streak.trackId)?.difficulty ??
          computeSongDifficulty(streak.trackDuration),
      ),
    )
    .sort((a, b) => b.streakScore - a.streakScore)
    .slice(0, 20)
    .map((streak, index) => ({
      ...streak,
      rank: index + 1,
    })) satisfies IronmenEntry[];
}
