import { describe, expect, it, beforeEach, vi } from "vitest";

import { SpotifyApiError } from "@/lib/spotify";
import { GET } from "./route";

const mockGetSessionOrUnauth = vi.fn();
const mockGetSpotifyToken = vi.fn();
const mockGetCachedSpotifyResult = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getSessionOrUnauth: () => mockGetSessionOrUnauth(),
  getSpotifyToken: (...args: unknown[]) => mockGetSpotifyToken(...args),
}));

vi.mock("@/lib/spotify-request-cache", () => ({
  getCachedSpotifyResult: (...args: unknown[]) =>
    mockGetCachedSpotifyResult(...args),
}));

vi.mock("@/lib/spotify", async () => {
  const actual = await vi.importActual<typeof import("@/lib/spotify")>(
    "@/lib/spotify",
  );
  return {
    ...actual,
    getPlaylistTracks: vi.fn(),
  };
});

describe("GET /api/playlists/[playlistId]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSessionOrUnauth.mockResolvedValue({
      session: { user: { id: "user-1" } },
      error: null,
    });
    mockGetSpotifyToken.mockResolvedValue("spotify-token");
  });

  it("returns track items on success", async () => {
    mockGetCachedSpotifyResult.mockResolvedValue([
      { id: "track-1", name: "Track One" },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ playlistId: "playlist-1" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      items: [{ id: "track-1", name: "Track One" }],
    });
  });

  it("returns a structured forbidden response for 403 playlist access failures", async () => {
    mockGetCachedSpotifyResult.mockRejectedValue(
      new SpotifyApiError(403, "forbidden"),
    );

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ playlistId: "playlist-1" }),
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "spotify_forbidden",
        message:
          "Spotify denied access to this playlist. Reconnect Spotify to grant collaborative playlist access, or try a different playlist.",
        retryAfterSeconds: null,
        status: 403,
      },
    });
  });

  it("returns retry-after metadata for 429 playlist rate limits", async () => {
    mockGetCachedSpotifyResult.mockRejectedValue(
      new SpotifyApiError(429, "rate limited", 12),
    );

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ playlistId: "playlist-1" }),
    });

    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("12");
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "spotify_rate_limited",
        message: "Spotify rate limited playlist track lookup.",
        retryAfterSeconds: 12,
        status: 429,
      },
    });
  });
});
