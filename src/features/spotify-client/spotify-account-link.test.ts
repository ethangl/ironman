import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

vi.mock("@/lib/convex-auth-client", () => ({
  convexAuthClient: {
    $fetch: (...args: unknown[]) => mockFetch(...args),
  },
}));

import {
  clearCachedSpotifyAccountLink,
  hasCachedSpotifyAccountLink,
} from "./spotify-account-link";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("spotify-account-link", () => {
  beforeEach(() => {
    clearCachedSpotifyAccountLink();
    mockFetch.mockReset();
  });

  it("reuses a cached account-link result for the same user", async () => {
    mockFetch.mockResolvedValue([{ providerId: "spotify" }]);

    await expect(hasCachedSpotifyAccountLink("user-1")).resolves.toBe(true);
    await expect(hasCachedSpotifyAccountLink("user-1")).resolves.toBe(true);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent account-link checks for the same user", async () => {
    const deferred = createDeferred<{ providerId: string }[]>();
    mockFetch.mockImplementation(() => deferred.promise);

    const first = hasCachedSpotifyAccountLink("user-1");
    const second = hasCachedSpotifyAccountLink("user-1");

    expect(mockFetch).toHaveBeenCalledTimes(1);

    deferred.resolve([{ providerId: "spotify" }]);

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it("does not share account-link state across users", async () => {
    mockFetch
      .mockResolvedValueOnce([{ providerId: "spotify" }])
      .mockResolvedValueOnce([]);

    await expect(hasCachedSpotifyAccountLink("user-1")).resolves.toBe(true);
    await expect(hasCachedSpotifyAccountLink("user-2")).resolves.toBe(false);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("clears a failed request instead of caching it", async () => {
    mockFetch.mockRejectedValue(new Error("nope"));

    await expect(hasCachedSpotifyAccountLink("user-1")).resolves.toBe(false);
    await expect(hasCachedSpotifyAccountLink("user-1")).resolves.toBe(false);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
