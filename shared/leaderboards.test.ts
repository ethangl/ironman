import { describe, expect, it } from "vitest";

import {
  buildBangersBoard,
  buildBangersBoardFromSongSummaries,
  buildHellscapeBoard,
  buildHellscapeBoardFromSongSummaries,
  buildIronmenBoard,
  buildIronmenBoardFromSongSummaries,
  buildSongSummaryRecords,
  buildTrackLeaderboard,
  buildTrackLeaderboardFromSortedBestStreaks,
  type LeaderboardStreakRecord,
} from "./leaderboards";

function buildStreak(
  overrides: Partial<LeaderboardStreakRecord> = {},
): LeaderboardStreakRecord {
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
    trackDuration: overrides.trackDuration ?? 100_000,
    startedAtMs: overrides.startedAtMs ?? 1_000,
    endedAtMs: overrides.endedAtMs,
    userName: overrides.userName ?? overrides.userId ?? "user-1",
    userImage: overrides.userImage ?? null,
    weaknessCount: overrides.weaknessCount ?? 0,
  };
}

describe("track leaderboards", () => {
  it("dedupes duplicate users before ranking a track", () => {
    const result = buildTrackLeaderboard(
      [
        buildStreak({ userId: "user-1", count: 5 }),
        buildStreak({ id: "older-user-1", userId: "user-1", count: 3 }),
        buildStreak({ userId: "user-2", count: 4 }),
      ],
      "track-1",
      null,
    );

    expect(result.leaderboard).toHaveLength(2);
    expect(result.leaderboard[0].userId).toBe("user-1");
    expect(result.leaderboard[0].count).toBe(5);
    expect(result.leaderboard[1].userId).toBe("user-2");
  });

  it("returns my entry when it falls below the top ten", () => {
    const ranked = Array.from({ length: 11 }, (_, index) =>
      buildStreak({
        id: `streak-${index + 1}`,
        userId: `user-${index + 1}`,
        count: 100 - index,
        startedAtMs: index,
      }),
    );

    const result = buildTrackLeaderboardFromSortedBestStreaks(
      ranked,
      "user-11",
    );

    expect(result.leaderboard).toHaveLength(10);
    expect(result.myEntry?.userId).toBe("user-11");
    expect(result.myEntry?.rank).toBe(11);
  });
});

describe("song summaries", () => {
  it("produce the same bangers and hellscape boards as raw streak aggregates", () => {
    const streaks = [
      buildStreak({
        id: "track-1-user-1",
        userId: "user-1",
        trackId: "track-1",
        count: 8,
        weaknessCount: 1,
        trackDuration: 180_000,
      }),
      buildStreak({
        id: "track-1-user-2",
        userId: "user-2",
        trackId: "track-1",
        count: 4,
        weaknessCount: 0,
        trackDuration: 180_000,
      }),
      buildStreak({
        id: "track-2-user-3",
        userId: "user-3",
        trackId: "track-2",
        trackName: "Track Two",
        trackArtist: "Artist Two",
        count: 10,
        weaknessCount: 4,
        trackDuration: 240_000,
      }),
    ];

    const summaries = buildSongSummaryRecords(streaks);

    expect(
      buildBangersBoardFromSongSummaries(
        [...summaries].sort(
          (a, b) =>
            b.avgCountRounded - a.avgCountRounded ||
            b.weaknessFavorability - a.weaknessFavorability,
        ),
      ),
    ).toEqual(buildBangersBoard(streaks));
    expect(
      buildHellscapeBoardFromSongSummaries(
        [...summaries].sort((a, b) => b.difficulty - a.difficulty),
      ),
    ).toEqual(buildHellscapeBoard(streaks));
  });

  it("produce the same ironmen board as the raw streak aggregation path", () => {
    const streaks = [
      buildStreak({
        id: "track-1-user-1",
        userId: "user-1",
        hardcore: true,
        trackId: "track-1",
        count: 5,
        weaknessCount: 1,
        trackDuration: 180_000,
      }),
      buildStreak({
        id: "track-1-user-2",
        userId: "user-2",
        trackId: "track-1",
        count: 3,
        weaknessCount: 0,
        trackDuration: 180_000,
      }),
      buildStreak({
        id: "track-2-user-3",
        userId: "user-3",
        trackId: "track-2",
        trackName: "Track Two",
        trackArtist: "Artist Two",
        count: 7,
        weaknessCount: 3,
        trackDuration: 220_000,
      }),
    ];
    const summaries = new Map(
      buildSongSummaryRecords(streaks).map((summary) => [summary.trackId, summary]),
    );

    expect(buildIronmenBoardFromSongSummaries(streaks, summaries)).toEqual(
      buildIronmenBoard(streaks),
    );
  });
});
