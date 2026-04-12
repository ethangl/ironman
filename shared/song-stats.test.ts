import { describe, expect, it } from "vitest";

import { buildSongSummaryRecords, type LeaderboardStreakRecord } from "./leaderboards";
import { buildSongStats, buildSongStatsFromSummary } from "./song-stats";

function buildStreak(
  overrides: Partial<LeaderboardStreakRecord> = {},
): LeaderboardStreakRecord & { endedAtMs?: number } {
  return {
    id: overrides.id ?? `streak-${overrides.userId ?? "user-1"}`,
    userId: overrides.userId ?? "user-1",
    count: overrides.count ?? 1,
    active: overrides.active ?? false,
    hardcore: overrides.hardcore ?? false,
    trackId: overrides.trackId ?? "track-1",
    trackName: overrides.trackName ?? "Track One",
    trackArtist: overrides.trackArtist ?? "Artist One",
    trackImage: overrides.trackImage ?? null,
    trackDuration: overrides.trackDuration ?? 180_000,
    startedAtMs: overrides.startedAtMs ?? 1_000,
    endedAtMs: overrides.endedAtMs,
    userName: overrides.userName ?? overrides.userId ?? "user-1",
    userImage: overrides.userImage ?? null,
    weaknessCount: overrides.weaknessCount ?? 0,
  };
}

describe("buildSongStatsFromSummary", () => {
  it("matches the full streak aggregation output", () => {
    const streaks = [
      buildStreak({
        id: "streak-1",
        userId: "user-1",
        count: 8,
        weaknessCount: 1,
        startedAtMs: 1_000,
        endedAtMs: 8_000,
      }),
      buildStreak({
        id: "streak-2",
        userId: "user-2",
        count: 3,
        weaknessCount: 0,
        startedAtMs: 2_000,
        endedAtMs: 5_000,
      }),
      buildStreak({
        id: "streak-3",
        userId: "user-3",
        count: 10,
        active: true,
        weaknessCount: 2,
        startedAtMs: 3_000,
      }),
    ];
    const summary = buildSongSummaryRecords(streaks)[0];
    const expected = buildSongStats(streaks);

    expect(
      buildSongStatsFromSummary(
        {
          trackName: summary.trackName,
          trackArtist: summary.trackArtist,
          trackImage: summary.trackImage,
          trackDuration: summary.trackDuration,
          totalPlays: summary.totalPlays,
          totalAttempts: summary.totalAttempts,
          uniqueUsers: summary.uniqueUsers,
          activeCount: summary.activeCount,
          avgStreak: summary.avgCountRounded,
          weaknessCount: summary.totalWeaknesses,
          difficulty: summary.difficulty,
        },
        { userName: "user-3", count: 10 },
        streaks
          .filter(
            (streak): streak is typeof streak & { endedAtMs: number } =>
              !streak.active && typeof streak.endedAtMs === "number",
          )
          .sort((a, b) => a.count - b.count)
          .slice(0, 5)
          .map((streak) => ({
            userName: streak.userName,
            count: streak.count,
            startedAtMs: streak.startedAtMs,
            endedAtMs: streak.endedAtMs,
          })),
      ),
    ).toEqual(expected);
  });
});
