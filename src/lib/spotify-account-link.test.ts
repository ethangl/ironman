import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

vi.mock("./convex-auth-client", () => ({
  convexAuthClient: {
    $fetch: (...args: unknown[]) => mockFetch(...args),
  },
}));

import {
  clearCachedSpotifyAccountLink,
  hasCachedSpotifyAccountLink,
} from "./spotify-account-link";

describe("spotify-account-link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCachedSpotifyAccountLink();
  });

  afterEach(() => {
    clearCachedSpotifyAccountLink();
  });

  it("treats wrapped Better Auth responses as linked accounts", async () => {
    mockFetch.mockResolvedValue({
      data: [
        {
          providerId: "spotify",
          id: "account-1",
        },
      ],
      error: null,
    });

    await expect(hasCachedSpotifyAccountLink("user-1")).resolves.toBe(true);

    expect(mockFetch).toHaveBeenCalledWith("/list-accounts", {
      method: "GET",
    });
  });

  it("treats raw array responses as linked accounts", async () => {
    mockFetch.mockResolvedValue([
      {
        providerId: "spotify",
        id: "account-1",
      },
    ]);

    await expect(hasCachedSpotifyAccountLink("user-1")).resolves.toBe(true);
  });
});
