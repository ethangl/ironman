import { afterEach, describe, expect, it, vi } from "vitest";

import { getCachedValue, setCachedValue } from "./cacheHelpers";
import { SpotifyApiError } from "./errors";
import { albumTracks, artistPage, searchResults } from "./search";
import {
  getAlbumTracks,
  getArtistPageDataResult,
  getSpotifyProfileMarket,
  searchSpotify,
} from "./searchApi";

vi.mock("./searchApi", () => ({
  getAlbumTracks: vi.fn(),
  getArtistPageDataResult: vi.fn(),
  getSpotifyProfileMarket: vi.fn(),
  searchSpotify: vi.fn(),
  searchTracks: vi.fn(),
}));

vi.mock("./cacheHelpers", () => ({
  getCachedValue: vi.fn(),
  setCachedValue: vi.fn(),
}));

const mockedGetCachedValue = vi.mocked(getCachedValue);
const mockedSetCachedValue = vi.mocked(setCachedValue);
const mockedGetAlbumTracks = vi.mocked(getAlbumTracks);
const mockedGetArtistPageDataResult = vi.mocked(getArtistPageDataResult);
const mockedGetSpotifyProfileMarket = vi.mocked(getSpotifyProfileMarket);
const mockedSearchSpotify = vi.mocked(searchSpotify);

type RegisteredAction = {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

function runAction<TArgs, TResult>(
  registeredAction: RegisteredAction,
  args: TArgs,
): Promise<TResult> {
  return registeredAction._handler({} as never, args) as Promise<TResult>;
}

function createArtistPage() {
  return {
    artist: {
      id: "artist-1",
      name: "ISIS",
      image: "artist.jpg",
      followerCount: 1234,
      genres: ["post-metal"],
    },
    topTracks: [],
    albums: [],
    singles: [],
  };
}

describe("spotify search artist page", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reuses a cached Spotify market when loading an artist page", async () => {
    const page = createArtistPage();
    mockedGetCachedValue
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ market: "US" });
    mockedGetArtistPageDataResult.mockResolvedValueOnce({
      page,
      usedReleaseFallback: false,
    });

    const result = await runAction<
      { artistId: string; accessToken: string; cacheScope?: string },
      typeof page
    >(artistPage as unknown as RegisteredAction, {
      artistId: "artist-1",
      accessToken: "spotify-token",
      cacheScope: "user-1",
    });

    expect(result).toEqual(page);
    expect(mockedGetSpotifyProfileMarket).not.toHaveBeenCalled();
    expect(mockedGetArtistPageDataResult).toHaveBeenCalledWith(
      "spotify-token",
      "artist-1",
      "US",
    );
    expect(mockedSetCachedValue).toHaveBeenCalledTimes(1);
    expect(mockedSetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "artistPage:user-1:artist-1",
      page,
      30 * 60 * 1000,
    );
  });

  it("caches the Spotify market after a successful lookup", async () => {
    const page = createArtistPage();
    mockedGetCachedValue.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockedGetSpotifyProfileMarket.mockResolvedValueOnce("US");
    mockedGetArtistPageDataResult.mockResolvedValueOnce({
      page,
      usedReleaseFallback: false,
    });

    await runAction<
      { artistId: string; accessToken: string; cacheScope?: string },
      typeof page
    >(artistPage as unknown as RegisteredAction, {
      artistId: "artist-1",
      accessToken: "spotify-token",
      cacheScope: "user-1",
    });

    expect(mockedGetSpotifyProfileMarket).toHaveBeenCalledWith("spotify-token");
    expect(mockedSetCachedValue).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      "spotifyMarket:user-1",
      { market: "US" },
      30 * 60 * 1000,
    );
    expect(mockedSetCachedValue).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      "artistPage:user-1:artist-1",
      page,
      30 * 60 * 1000,
    );
  });

  it("falls back to a marketless artist page request when Spotify profile lookup is rate limited", async () => {
    const page = createArtistPage();
    mockedGetCachedValue.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockedGetSpotifyProfileMarket.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );
    mockedGetArtistPageDataResult.mockResolvedValueOnce({
      page,
      usedReleaseFallback: false,
    });

    const result = await runAction<
      { artistId: string; accessToken: string; cacheScope?: string },
      typeof page
    >(artistPage as unknown as RegisteredAction, {
      artistId: "artist-1",
      accessToken: "spotify-token",
      cacheScope: "user-1",
    });

    expect(result).toEqual(page);
    expect(mockedGetArtistPageDataResult).toHaveBeenCalledWith(
      "spotify-token",
      "artist-1",
      null,
    );
    expect(mockedSetCachedValue).toHaveBeenCalledTimes(1);
    expect(mockedSetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "artistPage:user-1:artist-1",
      page,
      30 * 60 * 1000,
    );
  });

  it("does not cache an artist page when albums or singles used fallback data", async () => {
    const page = createArtistPage();
    mockedGetCachedValue
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ market: "US" });
    mockedGetArtistPageDataResult.mockResolvedValueOnce({
      page,
      usedReleaseFallback: true,
    });

    const result = await runAction<
      { artistId: string; accessToken: string; cacheScope?: string },
      typeof page
    >(artistPage as unknown as RegisteredAction, {
      artistId: "artist-1",
      accessToken: "spotify-token",
      cacheScope: "user-1",
    });

    expect(result).toEqual(page);
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("maps Spotify search rate limits to a user-facing search error", async () => {
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedSearchSpotify.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited", 30),
    );

    await expect(
      runAction(searchResults as unknown as RegisteredAction, {
        query: "Neurosis",
        accessToken: "spotify-token",
      }),
    ).rejects.toThrow("Spotify is rate limiting search right now.");

    expect(mockedSearchSpotify).toHaveBeenCalledTimes(1);
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("maps album track rate limits to a user-facing album error", async () => {
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetAlbumTracks.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction(albumTracks as unknown as RegisteredAction, {
        albumId: "album-429",
        accessToken: "spotify-token",
      }),
    ).rejects.toThrow("Spotify is rate limiting album requests right now.");

    expect(mockedGetAlbumTracks).toHaveBeenCalledTimes(1);
    expect(mockedSetCachedValue).not.toHaveBeenCalled();
  });

  it("caches album tracks by album id instead of user scope", async () => {
    const tracks = [
      {
        id: "track-1",
        name: "Weight",
        artist: "ISIS",
        albumName: "Oceanic",
        albumImage: "album.jpg",
        durationMs: 640000,
      },
    ];
    mockedGetCachedValue.mockResolvedValueOnce(null);
    mockedGetAlbumTracks.mockResolvedValueOnce(tracks);

    const result = await runAction<
      { albumId: string; accessToken: string },
      typeof tracks
    >(albumTracks as unknown as RegisteredAction, {
      albumId: "album-1",
      accessToken: "spotify-token",
    });

    expect(result).toEqual(tracks);
    expect(mockedGetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "albumTracks:album-1",
    );
    expect(mockedSetCachedValue).toHaveBeenCalledWith(
      expect.anything(),
      "albumTracks:album-1",
      tracks,
      10 * 365 * 24 * 60 * 60 * 1000,
    );
  });
});
