import { afterEach, describe, expect, it, vi } from "vitest";

import { SpotifyApiError } from "./errors";
import {
  favoriteArtists,
  playlistTracks,
  playlistsPage,
  recentlyPlayed,
  topArtists,
} from "./activity";
import {
  getFavoriteArtists,
  getPlaylistTracks,
  getRecentlyPlayed,
  getTopArtists,
  getUserPlaylists,
} from "./activityApi";

vi.mock("./activityApi", () => ({
  getFavoriteArtists: vi.fn(),
  getPlaylistTracks: vi.fn(),
  getRecentlyPlayed: vi.fn(),
  getTopArtists: vi.fn(),
  getUserPlaylists: vi.fn(),
}));

const mockedGetFavoriteArtists = vi.mocked(getFavoriteArtists);
const mockedGetPlaylistTracks = vi.mocked(getPlaylistTracks);
const mockedGetRecentlyPlayed = vi.mocked(getRecentlyPlayed);
const mockedGetTopArtists = vi.mocked(getTopArtists);
const mockedGetUserPlaylists = vi.mocked(getUserPlaylists);

type RegisteredAction = {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

function runAction<TArgs, TResult>(
  registeredAction: RegisteredAction,
  args: TArgs,
): Promise<TResult> {
  return registeredAction._handler({} as never, args) as Promise<TResult>;
}

describe("spotify activity component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a rate-limited fallback for recently played", async () => {
    mockedGetRecentlyPlayed.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction<
        { accessToken: string; limit?: number; cacheScope?: string },
        { items: unknown[]; rateLimited: boolean }
      >(recentlyPlayed as unknown as RegisteredAction, {
        accessToken: "spotify-token",
        limit: 25,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual({
      items: [],
      rateLimited: true,
    });
  });

  it("maps playlist track rate limits to the activity error", async () => {
    mockedGetPlaylistTracks.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction<
        { accessToken: string; playlistId: string; cacheScope?: string },
        never
      >(playlistTracks as unknown as RegisteredAction, {
        accessToken: "spotify-token",
        playlistId: "playlist-429",
        cacheScope: "user-1",
      }),
    ).rejects.toThrow("Spotify is rate limiting activity requests right now.");
  });

  it("returns an empty playlists page when spotify fails", async () => {
    mockedGetUserPlaylists.mockRejectedValueOnce(new Error("boom"));

    await expect(
      runAction<
        {
          accessToken: string;
          limit?: number;
          offset?: number;
          cacheScope?: string;
        },
        { items: unknown[]; total: number }
      >(playlistsPage as unknown as RegisteredAction, {
        accessToken: "spotify-token",
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
    mockedGetFavoriteArtists.mockRejectedValueOnce(new Error("boom"));

    await expect(
      runAction<
        { accessToken: string; limit?: number; cacheScope?: string },
        unknown[]
      >(favoriteArtists as unknown as RegisteredAction, {
        accessToken: "spotify-token",
        limit: 25,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual([]);
  });

  it("returns empty top artists when spotify fails", async () => {
    mockedGetTopArtists.mockRejectedValueOnce(new Error("boom"));

    await expect(
      runAction<
        { accessToken: string; limit?: number; cacheScope?: string },
        unknown[]
      >(topArtists as unknown as RegisteredAction, {
        accessToken: "spotify-token",
        limit: 10,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual([]);
  });
});
