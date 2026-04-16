import { afterEach, describe, expect, it, vi } from "vitest";

import { SpotifyApiError } from "./errors";
import {
  favoriteArtists,
  favoriteArtistsCached,
  playlistTracks,
  playlistsPageCached,
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
import { getCachedValue, setCachedValue } from "./cacheHelpers";

vi.mock("./activityApi", () => ({
  getFavoriteArtists: vi.fn(),
  getPlaylistTracks: vi.fn(),
  getRecentlyPlayed: vi.fn(),
  getTopArtists: vi.fn(),
  getUserPlaylists: vi.fn(),
}));

vi.mock("./cacheHelpers", () => ({
  getCachedValue: vi.fn(),
  setCachedValue: vi.fn(),
}));

const mockedGetCachedValue = vi.mocked(getCachedValue);
const mockedSetCachedValue = vi.mocked(setCachedValue);
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

describe("spotify activity caching", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached recently played data without hitting Spotify", async () => {
    const cached = {
      items: [
        {
          playedAt: "2026-04-09T12:00:00.000Z",
          track: {
            id: "track-1",
            name: "Track One",
            artist: "Artist One",
            albumName: "Album One",
            albumImage: "cover.jpg",
            durationMs: 180000,
          },
        },
      ],
      rateLimited: false,
    };
    mockedGetCachedValue.mockResolvedValueOnce(cached);

    const result = await runAction<
      { accessToken: string; limit?: number; cacheScope?: string },
      typeof cached
    >(recentlyPlayed as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      limit: 10,
      cacheScope: "user-1",
    });

    expect(result).toEqual(cached);
    expect(mockedGetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "recentlyPlayed:user-1:10",
    );
    expect(mockedGetRecentlyPlayed).not.toHaveBeenCalled();
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("returns a rate-limited fallback for recently played without caching it", async () => {
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetRecentlyPlayed.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    const result = await runAction<
      { accessToken: string; limit?: number; cacheScope?: string },
      { items: unknown[]; rateLimited: boolean }
    >(recentlyPlayed as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      limit: 25,
      cacheScope: "user-1",
    });

    expect(result).toEqual({
      items: [],
      rateLimited: true,
    });
    expect(mockedGetRecentlyPlayed).toHaveBeenCalledWith("spotify-token", 25);
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("returns the recently played rate-limited fallback on Spotify 429", async () => {
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetRecentlyPlayed.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited", 30),
    );

    await expect(
      runAction<
        { accessToken: string; limit?: number; cacheScope?: string },
        { items: unknown[]; rateLimited: boolean }
      >(recentlyPlayed as unknown as RegisteredAction, {
        accessToken: "spotify-token",
        limit: 26,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual({
      items: [],
      rateLimited: true,
    });

    expect(mockedGetRecentlyPlayed).toHaveBeenCalledTimes(1);
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("caches playlist pages with a scoped cache key", async () => {
    const playlists = {
      items: [
        {
          id: "playlist-1",
          name: "Playlist One",
          description: null,
          image: "playlist.jpg",
          owner: "User One",
          public: true,
          trackCount: 20,
        },
      ],
      total: 1,
    };
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetUserPlaylists.mockResolvedValueOnce(playlists);

    const result = await runAction<
      {
        accessToken: string;
        limit?: number;
        offset?: number;
        cacheScope?: string;
      },
      typeof playlists
    >(playlistsPage as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      limit: 10,
      offset: 20,
      cacheScope: "user-1",
    });

    expect(result).toEqual(playlists);
    expect(mockedGetUserPlaylists).toHaveBeenCalledWith("spotify-token", 10, 20);
    expect(mockedSetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "playlistsPage:user-1:10:20",
      playlists,
      5 * 60 * 1000,
    );
  });

  it("returns cached playlist pages without hitting Spotify", async () => {
    const playlists = {
      items: [
        {
          id: "playlist-1",
          name: "Playlist One",
          description: null,
          image: "playlist.jpg",
          owner: "User One",
          public: true,
          trackCount: 20,
        },
      ],
      total: 1,
    };
    mockedGetCachedValue.mockResolvedValueOnce(playlists);

    const result = await runAction<
      { limit?: number; offset?: number; cacheScope?: string },
      typeof playlists
    >(playlistsPageCached as unknown as RegisteredAction, {
      limit: 10,
      offset: 20,
      cacheScope: "user-1",
    });

    expect(result).toEqual(playlists);
    expect(mockedGetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "playlistsPage:user-1:10:20",
    );
    expect(mockedGetUserPlaylists).not.toHaveBeenCalled();
  });

  it("returns cached playlist tracks without hitting Spotify", async () => {
    const tracks = [
      {
        id: "track-1",
        name: "Track One",
        artist: "Artist One",
        albumName: "Album One",
        albumImage: "cover.jpg",
        durationMs: 180000,
      },
    ];
    mockedGetCachedValue.mockResolvedValueOnce(tracks);

    const result = await runAction<
      { accessToken: string; playlistId: string; cacheScope?: string },
      typeof tracks
    >(playlistTracks as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      playlistId: "playlist-1",
      cacheScope: "user-1",
    });

    expect(result).toEqual(tracks);
    expect(mockedGetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "playlistTracks:user-1:playlist-1",
    );
    expect(mockedGetPlaylistTracks).not.toHaveBeenCalled();
  });

  it("maps playlist track rate limits to the existing activity error", async () => {
    mockedGetCachedValue.mockResolvedValueOnce(null);
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

    expect(mockedGetPlaylistTracks).toHaveBeenCalledTimes(1);
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("caches top artists per user", async () => {
    const artists = [
      {
        id: "artist-1",
        name: "Artist One",
        image: "artist.jpg",
        followerCount: 1234,
        genres: ["metal"],
      },
    ];
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetTopArtists.mockResolvedValueOnce(artists);

    const result = await runAction<
      { accessToken: string; limit?: number; cacheScope?: string },
      typeof artists
    >(topArtists as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      limit: 8,
      cacheScope: "user-1",
    });

    expect(result).toEqual(artists);
    expect(mockedGetTopArtists).toHaveBeenCalledWith("spotify-token", 8);
    expect(mockedSetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "topArtists:user-1:8",
      artists,
      15 * 60 * 1000,
    );
  });

  it("caches favorite artists per user", async () => {
    const artists = [
      {
        id: "artist-2",
        name: "Artist Two",
        image: "artist-2.jpg",
        followerCount: 4321,
        genres: ["doom"],
      },
    ];
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetFavoriteArtists.mockResolvedValueOnce(artists);

    const result = await runAction<
      { accessToken: string; limit?: number; cacheScope?: string },
      typeof artists
    >(favoriteArtists as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      limit: 25,
      cacheScope: "user-1",
    });

    expect(result).toEqual(artists);
    expect(mockedGetFavoriteArtists).toHaveBeenCalledWith("spotify-token", 25);
    expect(mockedSetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "favoriteArtists:user-1:25",
      artists,
      15 * 60 * 1000,
    );
  });

  it("returns cached favorite artists without hitting Spotify", async () => {
    const artists = [
      {
        id: "artist-2",
        name: "Artist Two",
        image: "artist-2.jpg",
        followerCount: 4321,
        genres: ["doom"],
      },
    ];
    mockedGetCachedValue.mockResolvedValueOnce(artists);

    const result = await runAction<
      { limit?: number; cacheScope?: string },
      typeof artists
    >(favoriteArtistsCached as unknown as RegisteredAction, {
      limit: 25,
      cacheScope: "user-1",
    });

    expect(result).toEqual(artists);
    expect(mockedGetFavoriteArtists).not.toHaveBeenCalled();
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("returns cached favorite artists when a forced refresh fails", async () => {
    const artists = [
      {
        id: "artist-2",
        name: "Artist Two",
        image: "artist-2.jpg",
        followerCount: 4321,
        genres: ["doom"],
      },
    ];
    mockedGetCachedValue.mockResolvedValueOnce(artists);
    mockedGetFavoriteArtists.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    const result = await runAction<
      {
        accessToken: string;
        limit?: number;
        cacheScope?: string;
        forceRefresh?: boolean;
      },
      typeof artists
    >(favoriteArtists as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      limit: 25,
      cacheScope: "user-1",
      forceRefresh: true,
    });

    expect(result).toEqual(artists);
  });

});
