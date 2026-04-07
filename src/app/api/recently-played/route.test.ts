import { describe, expect, it, beforeEach, vi } from "vitest";

import { SpotifyApiError } from "@/lib/spotify";
import { GET } from "./route";

const mockGetSessionOrUnauth = vi.fn();
const mockGetSpotifyToken = vi.fn();
const mockGetCachedSpotifyResult = vi.fn();
const mockSetCachedSpotifyResult = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getSessionOrUnauth: () => mockGetSessionOrUnauth(),
  getSpotifyToken: (...args: unknown[]) => mockGetSpotifyToken(...args),
}));

vi.mock("@/lib/spotify-request-cache", () => ({
  getCachedSpotifyResult: (...args: unknown[]) =>
    mockGetCachedSpotifyResult(...args),
  setCachedSpotifyResult: (...args: unknown[]) =>
    mockSetCachedSpotifyResult(...args),
}));

vi.mock("@/lib/spotify", async () => {
  const actual = await vi.importActual<typeof import("@/lib/spotify")>(
    "@/lib/spotify",
  );
  return {
    ...actual,
    getRecentlyPlayed: vi.fn(),
  };
});

describe("GET /api/recently-played", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSessionOrUnauth.mockResolvedValue({
      session: { user: { id: "user-1" } },
      error: null,
    });
    mockGetSpotifyToken.mockResolvedValue("spotify-token");
  });

  it("returns cached items on success", async () => {
    mockGetCachedSpotifyResult.mockResolvedValue([
      { playedAt: "2026-04-07T00:00:00.000Z", track: { id: "track-1" } },
    ]);

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      { playedAt: "2026-04-07T00:00:00.000Z", track: { id: "track-1" } },
    ]);
  });

  it("returns an empty list with a rate-limit header and seeds cooldown cache on 429", async () => {
    mockGetCachedSpotifyResult.mockRejectedValue(
      new SpotifyApiError(429, "rate limited", 5),
    );

    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-spotify-rate-limited")).toBe("1");
    await expect(res.json()).resolves.toEqual([]);
    expect(mockSetCachedSpotifyResult).toHaveBeenCalledWith(
      "recently-played:user-1",
      [],
      30_000,
    );
  });
});
