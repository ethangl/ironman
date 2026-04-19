import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("spotify search component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to a marketless artist page request when profile market lookup is rate limited", async () => {
    const page = createArtistPage();
    mockedGetSpotifyProfileMarket.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );
    mockedGetArtistPageDataResult.mockResolvedValueOnce({
      page,
      usedReleaseFallback: false,
    });

    await expect(
      runAction<
        { artistId: string; accessToken: string; cacheScope?: string },
        typeof page
      >(artistPage as unknown as RegisteredAction, {
        artistId: "artist-1",
        accessToken: "spotify-token",
        cacheScope: "user-1",
      }),
    ).resolves.toEqual(page);

    expect(mockedGetArtistPageDataResult).toHaveBeenCalledWith(
      "spotify-token",
      "artist-1",
      null,
    );
  });

  it("returns null for spotify 404 artist misses", async () => {
    mockedGetSpotifyProfileMarket.mockResolvedValueOnce("US");
    mockedGetArtistPageDataResult.mockRejectedValueOnce(
      new SpotifyApiError(404, "not found"),
    );

    await expect(
      runAction<
        { artistId: string; accessToken: string; cacheScope?: string },
        null
      >(artistPage as unknown as RegisteredAction, {
        artistId: "missing-artist",
        accessToken: "spotify-token",
      }),
    ).resolves.toBeNull();
  });

  it("maps spotify search rate limits to a user-facing search error", async () => {
    mockedSearchSpotify.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited", 30),
    );

    await expect(
      runAction(searchResults as unknown as RegisteredAction, {
        query: "Neurosis",
        accessToken: "spotify-token",
      }),
    ).rejects.toThrow("Spotify is rate limiting search right now.");
  });

  it("maps album track rate limits to a user-facing album error", async () => {
    mockedGetAlbumTracks.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction(albumTracks as unknown as RegisteredAction, {
        albumId: "album-429",
        accessToken: "spotify-token",
      }),
    ).rejects.toThrow("Spotify is rate limiting album requests right now.");
  });
});
