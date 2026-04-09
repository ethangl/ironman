import { beforeEach, describe, expect, it, vi } from "vitest";

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
    getArtistPageData: vi.fn(),
  };
});

describe("GET /api/artists/[artistId]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSessionOrUnauth.mockResolvedValue({
      session: { user: { id: "user-1" } },
      error: null,
    });
    mockGetSpotifyToken.mockResolvedValue("spotify-token");
  });

  it("returns artist page data on success", async () => {
    mockGetCachedSpotifyResult.mockResolvedValue({
      artist: {
        id: "artist-1",
        name: "ISIS",
        image: "artist.jpg",
        followerCount: 123,
        genres: ["post-metal"],
      },
      topTracks: [{ id: "track-1", name: "Weight" }],
      releases: [{ id: "album-1", name: "Oceanic" }],
    });

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ artistId: "artist-1" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      artist: {
        id: "artist-1",
        name: "ISIS",
        image: "artist.jpg",
        followerCount: 123,
        genres: ["post-metal"],
      },
      topTracks: [{ id: "track-1", name: "Weight" }],
      releases: [{ id: "album-1", name: "Oceanic" }],
    });
  });

  it("returns a structured 404 when Spotify cannot find the artist", async () => {
    mockGetCachedSpotifyResult.mockRejectedValue(
      new SpotifyApiError(404, "not found"),
    );

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ artistId: "artist-1" }),
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "spotify_upstream_error",
        message: "Could not find that artist on Spotify.",
        retryAfterSeconds: null,
        status: 404,
      },
    });
  });
});
