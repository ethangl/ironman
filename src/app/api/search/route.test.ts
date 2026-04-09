import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const mockGetSessionOrUnauth = vi.fn();
const mockGetSpotifyToken = vi.fn();
const mockSearchSpotify = vi.fn();
const mockFindMany = vi.fn();
const mockGroupBy = vi.fn();
const mockComputeSongDifficulty = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getSessionOrUnauth: () => mockGetSessionOrUnauth(),
  getSpotifyToken: (...args: unknown[]) => mockGetSpotifyToken(...args),
}));

vi.mock("@/lib/spotify", async () => {
  const actual = await vi.importActual<typeof import("@/lib/spotify")>(
    "@/lib/spotify",
  );
  return {
    ...actual,
    searchSpotify: (...args: unknown[]) => mockSearchSpotify(...args),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    streak: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    weakness: {
      groupBy: (...args: unknown[]) => mockGroupBy(...args),
    },
  },
}));

vi.mock("@/lib/difficulty", () => ({
  computeSongDifficulty: (...args: unknown[]) => mockComputeSongDifficulty(...args),
}));

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSessionOrUnauth.mockResolvedValue({
      session: { user: { id: "user-1" } },
      error: null,
    });
    mockGetSpotifyToken.mockResolvedValue("spotify-token");
    mockFindMany.mockResolvedValue([
      {
        id: "streak-1",
        trackId: "track-1",
        count: 12,
        user: { name: "Tony" },
      },
      {
        id: "streak-2",
        trackId: "track-1",
        count: 6,
        user: { name: "Pepper" },
      },
      {
        id: "streak-3",
        trackId: "track-1",
        count: 3,
        user: { name: "Rhodey" },
      },
    ]);
    mockGroupBy.mockResolvedValue([
      { streakId: "streak-1", _count: 3 },
      { streakId: "streak-2", _count: 2 },
      { streakId: "streak-3", _count: 1 },
    ]);
    mockComputeSongDifficulty.mockReturnValue(7);
  });

  it("returns tracks, artists, and playlists while enriching only tracks", async () => {
    mockSearchSpotify.mockResolvedValue({
      tracks: [
        {
          id: "track-1",
          name: "Track One",
          artist: "Artist One",
          albumName: "Album One",
          albumImage: "cover.jpg",
          durationMs: 180_000,
        },
      ],
      artists: [
        {
          id: "artist-1",
          name: "Artist One",
          image: "artist.jpg",
          followerCount: 1234,
          genres: ["rock"],
        },
      ],
      playlists: [
        {
          id: "playlist-1",
          name: "Workout Mix",
          description: null,
          image: "playlist.jpg",
          owner: "Pepper",
          public: true,
          trackCount: 42,
        },
      ],
    });

    const req = new NextRequest("http://localhost/api/search?q=track%20one");
    const res = await GET(req);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      tracks: [
        {
          id: "track-1",
          name: "Track One",
          artist: "Artist One",
          albumName: "Album One",
          albumImage: "cover.jpg",
          durationMs: 180_000,
          topStreak: { count: 12, userName: "Tony" },
          difficulty: 7,
        },
      ],
      artists: [
        {
          id: "artist-1",
          name: "Artist One",
          image: "artist.jpg",
          followerCount: 1234,
          genres: ["rock"],
        },
      ],
      playlists: [
        {
          id: "playlist-1",
          name: "Workout Mix",
          description: null,
          image: "playlist.jpg",
          owner: "Pepper",
          public: true,
          trackCount: 42,
        },
      ],
    });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { trackId: { in: ["track-1"] } },
      orderBy: { count: "desc" },
      include: { user: { select: { name: true } } },
    });
    expect(mockGroupBy).toHaveBeenCalledWith({
      by: ["streakId"],
      where: { streakId: { in: ["streak-1", "streak-2", "streak-3"] } },
      _count: true,
    });
    expect(mockComputeSongDifficulty).toHaveBeenCalledWith(180_000, {
      weaknessRate: 6 / 21,
      avgCount: 7,
      totalAttempts: 3,
    });
  });

  it("returns a structured error when Spotify search fails", async () => {
    mockSearchSpotify.mockRejectedValue(new Error("boom"));

    const req = new NextRequest("http://localhost/api/search?q=isis");
    const res = await GET(req);

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "spotify_upstream_error",
        message: "Could not search Spotify right now.",
        status: 502,
      },
    });
  });
});
