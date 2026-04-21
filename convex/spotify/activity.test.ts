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
import { loadPlaylistTracks, loadPlaylistsPage } from "./playlists";
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
        { limit: number; cacheScope: string },
        { items: unknown[]; rateLimited: boolean }
      >(loadRecentlyPlayed as unknown as RegisteredAction, {
        limit: 25,
        cacheScope: "user-1",
      }),
    ).resolves.toEqual({
      items: [],
      rateLimited: true,
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
