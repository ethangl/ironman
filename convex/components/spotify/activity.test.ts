import { afterEach, describe, expect, it, vi } from "vitest";

import { SpotifyApiError } from "./errors";
import {
  bootstrap,
  playlistTracks,
  playlistsPage,
  recentlyPlayed,
  topArtists,
} from "./activity";
import {
  getPlaylistTracks,
  getRecentlyPlayed,
  getTopArtists,
  getUserPlaylists,
} from "./activityApi";
import { getCachedValue, setCachedValue } from "./cacheHelpers";

vi.mock("./activityApi", () => ({
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
          tracks: null,
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

  it("caches bootstrap responses with a scoped aggregate key", async () => {
    const recentTracks = [
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
    ];
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
          tracks: null,
        },
      ],
      total: 1,
    };
    const favoriteArtists = [
      {
        id: "artist-1",
        name: "Artist One",
        image: "artist.jpg",
        followerCount: 1234,
        genres: ["metal"],
      },
    ];
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetRecentlyPlayed.mockResolvedValueOnce(recentTracks);
    mockedGetUserPlaylists.mockResolvedValueOnce(playlists);
    mockedGetTopArtists.mockResolvedValueOnce(favoriteArtists);

    const result = await runAction<
      {
        accessToken: string;
        playlistLimit?: number;
        playlistOffset?: number;
        topArtistsLimit?: number;
        recentlyPlayedLimit?: number;
        cacheScope?: string;
      },
      {
        favoriteArtists: typeof favoriteArtists;
        playlists: typeof playlists.items;
        playlistsTotal: number;
        recentTracks: typeof recentTracks;
      }
    >(bootstrap as unknown as RegisteredAction, {
      accessToken: "spotify-token",
      playlistLimit: 25,
      topArtistsLimit: 5,
      recentlyPlayedLimit: 12,
      cacheScope: "user-1",
    });

    expect(result).toEqual({
      favoriteArtists,
      playlists: playlists.items,
      playlistsTotal: 1,
      recentTracks,
    });
    expect(mockedSetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "activityBootstrap:user-1:25:0:5:12",
      {
        favoriteArtists,
        playlists: playlists.items,
        playlistsTotal: 1,
        recentTracks,
      },
      30 * 1000,
    );
  });
});
