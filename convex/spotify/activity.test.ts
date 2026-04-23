import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../spotifySession", () => ({
  requireSpotifyAccessToken: vi.fn().mockResolvedValue("spotify-token"),
}));

vi.mock("./client", () => ({
  spotifyFetch: vi.fn(),
}));

import { loadFavoriteArtists, loadTopArtists } from "./artists";
import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import { loadPlaylist, loadPlaylistTracks, loadPlaylistsPage } from "./playlists";
import { loadRecentlyPlayed } from "./tracks";

const mockedSpotifyFetch = vi.mocked(spotifyFetch);

type RegisteredAction = {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

function runAction<TArgs, TResult>(
  registeredAction: RegisteredAction,
  args: TArgs,
): Promise<TResult> {
  return registeredAction._handler({} as never, args) as Promise<TResult>;
}

describe("spotify activity loaders", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a rate-limited fallback for recently played", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction<
        { before: number | null; limit: number; cacheScope: string },
        {
          page: {
            hasMore: boolean;
            items: unknown[];
            limit: number;
            nextCursor: number | null;
            total: number;
          };
          rateLimited: boolean;
        }
      >(loadRecentlyPlayed as unknown as RegisteredAction, {
        before: null,
        limit: 25,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual({
      page: {
        hasMore: false,
        items: [],
        limit: 25,
        nextCursor: null,
        total: 0,
      },
      rateLimited: true,
    });
  });

  it("maps recently played paging metadata", async () => {
    mockedSpotifyFetch.mockResolvedValueOnce({
      cursors: {
        before: "1713807300000",
      },
      items: [
        {
          played_at: "2026-04-22T18:15:00.000Z",
          track: {
            id: "track-1",
            name: "Track 1",
            artists: [{ name: "Artist 1" }],
            album: {
              name: "Album 1",
              images: [{ url: "https://example.com/album-1.jpg" }],
            },
            duration_ms: 123000,
          },
        },
      ],
      limit: 2,
      next: "https://api.spotify.com/v1/me/player/recently-played?limit=2&before=1713807300000",
      total: 10,
    });

    await expect(
      runAction<
        { before: number | null; limit: number; cacheScope: string },
        {
          page: {
            hasMore: boolean;
            items: Array<{
              playedAt: string;
              track: {
                albumImage: string | null;
                albumName: string;
                artist: string;
                durationMs: number;
                id: string;
                name: string;
              };
            }>;
            limit: number;
            nextCursor: number | null;
            total: number;
          };
          rateLimited: boolean;
        }
      >(loadRecentlyPlayed as unknown as RegisteredAction, {
        before: null,
        limit: 2,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual({
      page: {
        hasMore: true,
        items: [
          {
            playedAt: "2026-04-22T18:15:00.000Z",
            track: {
              albumImage: "https://example.com/album-1.jpg",
              albumName: "Album 1",
              artist: "Artist 1",
              durationMs: 123000,
              id: "track-1",
              name: "Track 1",
            },
          },
        ],
        limit: 2,
        nextCursor: 1713807300000,
        total: 10,
      },
      rateLimited: false,
    });
  });

  it("maps playlist track rate limits to the activity error", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction<{ playlistId: string; cacheScope: string }, never>(
        loadPlaylistTracks as unknown as RegisteredAction,
        {
          playlistId: "playlist-429",
          cacheScope: "user-1",
        },
      ),
    ).rejects.toThrow("Spotify is rate limiting activity requests right now.");
  });

  it("returns null for a missing playlist", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(
      new SpotifyApiError(404, "not found"),
    );

    await expect(
      runAction<{ playlistId: string; cacheScope: string }, unknown>(
        loadPlaylist as unknown as RegisteredAction,
        {
          playlistId: "playlist-missing",
          cacheScope: "user-1",
        },
      ),
    ).resolves.toBeNull();
  });

  it("maps a playlist summary", async () => {
    mockedSpotifyFetch.mockResolvedValueOnce({
      id: "playlist-1",
      name: "Heavy Rotation",
      description: "Loud ones",
      images: [{ url: "https://example.com/playlist.jpg" }],
      owner: { display_name: "ethan" },
      public: false,
      tracks: { total: 12 },
    });

    await expect(
      runAction<
        { playlistId: string; cacheScope: string },
        {
          description: string | null;
          id: string;
          image: string | null;
          name: string;
          owner: string | null;
          public: boolean;
          trackCount: number;
        } | null
      >(loadPlaylist as unknown as RegisteredAction, {
        playlistId: "playlist-1",
        cacheScope: "user-1",
      }),
    ).resolves.toEqual({
      id: "playlist-1",
      name: "Heavy Rotation",
      description: "Loud ones",
      image: "https://example.com/playlist.jpg",
      owner: "ethan",
      public: false,
      trackCount: 12,
    });
  });

  it("returns an empty playlists page when spotify fails", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(new Error("boom"));

    await expect(
      runAction<
        {
          limit: number;
          offset: number;
          cacheScope: string;
        },
        { items: unknown[]; total: number }
      >(loadPlaylistsPage as unknown as RegisteredAction, {
        limit: 10,
        offset: 20,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual({
      items: [],
      total: 0,
    });
  });

  it("returns empty favorite artists when spotify fails", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(new Error("boom"));

    await expect(
      runAction<{ limit: number; cacheScope: string }, unknown[]>(
        loadFavoriteArtists as unknown as RegisteredAction,
        {
          limit: 25,
          cacheScope: "user-1",
        },
      ),
    ).resolves.toEqual([]);
  });

  it("returns empty top artists when spotify fails", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(new Error("boom"));

    await expect(
      runAction<{ limit: number; cacheScope: string }, unknown[]>(
        loadTopArtists as unknown as RegisteredAction,
        {
          limit: 10,
          cacheScope: "user-1",
        },
      ),
    ).resolves.toEqual([]);
  });
});
