import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLiveFeed } from "./use-live-feed";

const mockUseQuery = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

describe("useLiveFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports loading while the Convex query is unresolved", () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useLiveFeed());

    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it("returns feed items once the Convex query resolves", () => {
    mockUseQuery.mockReturnValue([
      {
        id: "feed-1",
        type: "lock_in",
        detail: null,
        trackName: "Test Track",
        trackArtist: "Test Artist",
        userName: "ethangl",
        userImage: null,
        createdAt: "2026-04-09T03:01:04.775Z",
      },
    ]);

    const { result } = renderHook(() => useLiveFeed());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.loading).toBe(false);
  });
});
