import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../spotifySession", () => ({
  requireSpotifyAccessToken: vi.fn().mockResolvedValue("spotify-token"),
}));

vi.mock("./client", () => ({
  spotifyFetch: vi.fn(),
}));

import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import { loadAlbumTracks } from "./albums";
import { loadArtistPage } from "./artists";
import { loadSearchResults } from "./search";

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

describe("spotify search loaders", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to a marketless artist page request when profile market lookup is rate limited", async () => {
    const page = createArtistPage();
    mockedSpotifyFetch
      .mockRejectedValueOnce(
        new SpotifyApiError(429, "rate limited"),
      )
      .mockResolvedValueOnce({
        id: "artist-1",
        name: "ISIS",
        images: [{ url: "artist.jpg" }],
        followers: { total: 1234 },
        genres: ["post-metal"],
      })
      .mockResolvedValueOnce({
        tracks: {
          items: [],
        },
      })
      .mockResolvedValueOnce({
        items: [],
      })
      .mockResolvedValueOnce({
        items: [],
      });

    await expect(
      runAction<
        { artistId: string; cacheScope: string },
        typeof page
      >(loadArtistPage as unknown as RegisteredAction, {
        artistId: "artist-1",
        cacheScope: "user-1",
      }),
    ).resolves.toEqual(page);
  });

  it("returns null for spotify 404 artist misses", async () => {
    mockedSpotifyFetch
      .mockResolvedValueOnce({ country: "US" })
      .mockRejectedValueOnce(
        new SpotifyApiError(404, "not found"),
      );

    await expect(
      runAction<
        { artistId: string; cacheScope: string },
        null
      >(loadArtistPage as unknown as RegisteredAction, {
        artistId: "missing-artist",
        cacheScope: "user-1",
      }),
    ).resolves.toBeNull();
  });

  it("maps spotify search rate limits to a user-facing search error", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction(loadSearchResults as unknown as RegisteredAction, {
        query: "Neurosis",
      }),
    ).rejects.toThrow("Spotify is rate limiting search right now.");
  });

  it("maps album track rate limits to a user-facing album error", async () => {
    mockedSpotifyFetch.mockRejectedValueOnce(
      new SpotifyApiError(429, "rate limited"),
    );

    await expect(
      runAction(loadAlbumTracks as unknown as RegisteredAction, {
        albumId: "album-429",
      }),
    ).rejects.toThrow("Spotify is rate limiting album requests right now.");
  });
});
