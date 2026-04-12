import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeLeaderboardsResponse } from "@shared/leaderboards";
import { useHomeLeaderboardsData } from "./use-home-leaderboards-data";

const mockUseStableQuery = vi.fn();

vi.mock("@/hooks/use-stable-query", () => ({
  useStableQuery: (...args: unknown[]) => mockUseStableQuery(...args),
}));

const HOME_RESPONSE: HomeLeaderboardsResponse = {
  global: [],
  ironmen: [
    {
      rank: 1,
      id: "streak-1",
      userId: "user-1",
      count: 7,
      active: true,
      hardcore: false,
      trackId: "track-1",
      trackName: "Test Track",
      trackArtist: "Test Artist",
      trackImage: null,
      trackDuration: 180000,
      userName: "Tester",
      userImage: null,
      streakScore: 8.5,
      songDifficulty: 1.2,
    },
  ],
  bangers: [],
  hellscape: [],
};

describe("useHomeLeaderboardsData", () => {
  it("returns the bundled home leaderboard payload", () => {
    mockUseStableQuery.mockReturnValue(HOME_RESPONSE);

    const { result } = renderHook(() => useHomeLeaderboardsData());

    expect(result.current.data).toEqual(HOME_RESPONSE);
    expect(result.current.loading).toBe(false);
  });

  it("keeps the empty shape while the query is still loading", () => {
    mockUseStableQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useHomeLeaderboardsData());

    expect(result.current.data).toEqual({
      global: [],
      ironmen: [],
      bangers: [],
      hellscape: [],
    });
    expect(result.current.loading).toBe(true);
  });
});
