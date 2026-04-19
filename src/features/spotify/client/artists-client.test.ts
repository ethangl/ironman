import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./spotify-convex-client", () => ({
  getAuthenticatedSpotifyConvexClient: vi.fn(),
}));

import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";
import { createConvexSpotifyArtistsClient } from "./artists-client";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

describe("spotifyArtistsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dedupes concurrent artist page requests for the same artist", async () => {
    const deferred = createDeferred<{
      artist: {
        id: string;
        name: string;
        image: string | null;
        followerCount: number;
        genres: string[];
      };
      topTracks: [];
      albums: [];
      singles: [];
    } | null>();
    const action = vi.fn().mockReturnValue(deferred.promise);

    vi.mocked(getAuthenticatedSpotifyConvexClient).mockResolvedValue({
      action,
    } as never);

    const client = createConvexSpotifyArtistsClient();
    const first = client.getPageData("artist-1");
    const second = client.getPageData("artist-1");
    await Promise.resolve();

    expect(getAuthenticatedSpotifyConvexClient).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(api.spotify.artistPage, {
      artistId: "artist-1",
    });

    deferred.resolve({
      artist: {
        id: "artist-1",
        name: "Jarboe",
        image: null,
        followerCount: 1,
        genres: [],
      },
      topTracks: [],
      albums: [],
      singles: [],
    });

    await expect(Promise.all([first, second])).resolves.toEqual([
      {
        artist: {
          id: "artist-1",
          name: "Jarboe",
          image: null,
          followerCount: 1,
          genres: [],
        },
        topTracks: [],
        albums: [],
        singles: [],
      },
      {
        artist: {
          id: "artist-1",
          name: "Jarboe",
          image: null,
          followerCount: 1,
          genres: [],
        },
        topTracks: [],
        albums: [],
        singles: [],
      },
    ]);
  });

  it("issues a fresh artist page request after the previous one settles", async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    vi.mocked(getAuthenticatedSpotifyConvexClient).mockResolvedValue({
      action,
    } as never);

    const client = createConvexSpotifyArtistsClient();

    await client.getPageData("artist-2");
    await client.getPageData("artist-2");

    expect(getAuthenticatedSpotifyConvexClient).toHaveBeenCalledTimes(2);
    expect(action).toHaveBeenCalledTimes(2);
  });
});
