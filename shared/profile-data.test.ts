import { describe, expect, it } from "vitest";

import {
  buildProfileData,
  buildProfileDataFromVisibleSortedStreaks,
} from "./profile-data";
import type { LeaderboardStreakRecord } from "./leaderboards";

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
    trackDuration: overrides.trackDuration ?? 180_000,
    startedAtMs: overrides.startedAtMs ?? 1_000,
    endedAtMs: overrides.endedAtMs,
    userName: overrides.userName ?? overrides.userId ?? "user-1",
    userImage: overrides.userImage ?? null,
    weaknessCount: overrides.weaknessCount ?? 0,
  };
}

describe("buildProfileDataFromVisibleSortedStreaks", () => {
  it("matches the legacy filtered and sorted builder output", () => {
    const user = { id: "user-1", name: "User One", image: null };
    const streaks = [
      buildStreak({ id: "hidden", count: 1 }),
      buildStreak({ id: "best", count: 8, trackId: "track-2", startedAtMs: 3_000 }),
      buildStreak({
        id: "active",
        count: 5,
        active: true,
        trackId: "track-3",
        startedAtMs: 4_000,
      }),
      buildStreak({ id: "older", count: 3, startedAtMs: 2_000, endedAtMs: 5_000 }),
    ];
    const visibleSorted = streaks
      .filter((streak) => streak.count > 1)
      .sort((a, b) => b.count - a.count);

    expect(buildProfileDataFromVisibleSortedStreaks(user, visibleSorted)).toEqual(
      buildProfileData(user, streaks),
    );
  });
});
