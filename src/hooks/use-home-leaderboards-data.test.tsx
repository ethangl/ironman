import { type ReactNode } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppDataClientProvider, createAppDataClient } from "@/data/client";
import type { HomeLeaderboardsResponse } from "@shared/leaderboards";
import { useHomeLeaderboardsData } from "./use-home-leaderboards-data";

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

function createWrapper(getHome: () => Promise<HomeLeaderboardsResponse>) {
  const client = createAppDataClient({
    leaderboards: {
      getGlobal: vi.fn().mockResolvedValue([]),
      getHome,
      getTrack: vi.fn().mockResolvedValue({ leaderboard: [], myEntry: null }),
      getIronmen: vi.fn().mockResolvedValue([]),
      getBangers: vi.fn().mockResolvedValue([]),
      getBrutality: vi.fn().mockResolvedValue([]),
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppDataClientProvider client={client}>{children}</AppDataClientProvider>;
  };
}

describe("useHomeLeaderboardsData", () => {
  it("loads the bundled home leaderboard payload", async () => {
    const getHome = vi.fn().mockResolvedValue(HOME_RESPONSE);

    const { result } = renderHook(() => useHomeLeaderboardsData(), {
      wrapper: createWrapper(getHome),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getHome).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(HOME_RESPONSE);
  });

  it("falls back to empty boards when the request fails", async () => {
    const getHome = vi.fn().mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useHomeLeaderboardsData(), {
      wrapper: createWrapper(getHome),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      global: [],
      ironmen: [],
      bangers: [],
      hellscape: [],
    });
  });
});
