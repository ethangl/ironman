import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAccessToken = vi.fn();

vi.mock("@/lib/convex-auth-client", () => ({
  convexAuthClient: {
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  },
}));

import {
  clearCachedSpotifyAccessToken,
  getCachedSpotifyAccessToken,
} from "../../lib/spotify-access-token";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("getCachedSpotifyAccessToken", () => {
  beforeEach(() => {
    clearCachedSpotifyAccessToken();
    mockGetAccessToken.mockReset();
  });

  it("reuses a still-valid cached token for the same user", async () => {
    mockGetAccessToken.mockResolvedValue({
      data: {
        accessToken: "spotify-token",
        accessTokenExpiresAt: Date.now() + 5 * 60 * 1000,
      },
    });

    await expect(getCachedSpotifyAccessToken("user-1")).resolves.toBe(
      "spotify-token",
    );
    await expect(getCachedSpotifyAccessToken("user-1")).resolves.toBe(
      "spotify-token",
    );

    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent token fetches for the same user", async () => {
    const deferred = createDeferred<{
      data: {
        accessToken: string;
        accessTokenExpiresAt: number;
      };
    }>();
    mockGetAccessToken.mockImplementation(() => deferred.promise);

    const first = getCachedSpotifyAccessToken("user-1");
    const second = getCachedSpotifyAccessToken("user-1");

    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
    deferred.resolve({
      data: {
        accessToken: "spotify-token",
        accessTokenExpiresAt: Date.now() + 5 * 60 * 1000,
      },
    });

    await expect(first).resolves.toBe("spotify-token");
    await expect(second).resolves.toBe("spotify-token");
  });

  it("does not share cached tokens across users", async () => {
    mockGetAccessToken
      .mockResolvedValueOnce({
        data: {
          accessToken: "token-1",
          accessTokenExpiresAt: Date.now() + 5 * 60 * 1000,
        },
      })
      .mockResolvedValueOnce({
        data: {
          accessToken: "token-2",
          accessTokenExpiresAt: Date.now() + 5 * 60 * 1000,
        },
      });

    await expect(getCachedSpotifyAccessToken("user-1")).resolves.toBe(
      "token-1",
    );
    await expect(getCachedSpotifyAccessToken("user-2")).resolves.toBe(
      "token-2",
    );

    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
  });

  it("does not cache missing tokens", async () => {
    mockGetAccessToken.mockResolvedValue({
      data: { accessToken: null },
    });

    await expect(getCachedSpotifyAccessToken("user-1")).resolves.toBeNull();
    await expect(getCachedSpotifyAccessToken("user-1")).resolves.toBeNull();

    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
  });
});
