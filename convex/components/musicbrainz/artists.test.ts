import { afterEach, describe, expect, it, vi } from "vitest";

import { MusicBrainzApiError } from "./errors";

const mockArtistBySpotifyIdFetch = vi.fn();
const mockSpotifyArtistIdByMusicBrainzIdFetch = vi.fn();

vi.mock("./caches", () => ({
  artistBySpotifyIdCache: {
    fetch: mockArtistBySpotifyIdFetch,
  },
  spotifyArtistIdByMusicBrainzIdCache: {
    fetch: mockSpotifyArtistIdByMusicBrainzIdFetch,
  },
}));

type RegisteredAction = {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

function runAction<TArgs, TResult>(
  registeredAction: RegisteredAction,
  args: TArgs,
): Promise<TResult> {
  return registeredAction._handler({} as never, args) as Promise<TResult>;
}

describe("musicbrainz artists", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("trims spotify artist ids before reading through the cache", async () => {
    const cached = {
      spotifyArtistId: "artist-1",
      spotifyUrl: "https://open.spotify.com/artist/artist-1",
      resolvedVia: "spotify_url" as const,
      matchCount: 1,
      artist: {
        id: "mbid-1",
        name: "ISIS",
        sortName: "ISIS",
        type: "Group",
        country: "US",
        disambiguation: "American post-metal band",
        spotifyUrl: "https://open.spotify.com/artist/artist-1",
        musicBrainzUrl: "https://musicbrainz.org/artist/mbid-1",
      },
      links: {
        homepage: "https://isis.example/",
        instagram: null,
        youtube: null,
        bandcamp: null,
      },
    };
    mockArtistBySpotifyIdFetch.mockResolvedValueOnce(cached);
    const { artistBySpotifyId } = await import("./artists");

    await expect(
      runAction<{ spotifyArtistId: string }, typeof cached>(
        artistBySpotifyId as unknown as RegisteredAction,
        { spotifyArtistId: "  artist-1  " },
      ),
    ).resolves.toEqual(cached);

    expect(mockArtistBySpotifyIdFetch).toHaveBeenCalledWith(expect.anything(), {
      spotifyArtistId: "artist-1",
    });
  });

  it("returns null when the spotify artist id is blank", async () => {
    const { artistBySpotifyId } = await import("./artists");

    await expect(
      runAction<{ spotifyArtistId: string }, null>(
        artistBySpotifyId as unknown as RegisteredAction,
        { spotifyArtistId: "   " },
      ),
    ).resolves.toBeNull();

    expect(mockArtistBySpotifyIdFetch).not.toHaveBeenCalled();
  });

  it("maps 404 musicbrainz misses to null", async () => {
    mockSpotifyArtistIdByMusicBrainzIdFetch.mockRejectedValueOnce(
      new MusicBrainzApiError(404, "not found"),
    );
    const { spotifyArtistIdByMusicBrainzId } = await import("./artists");

    await expect(
      runAction<{ musicBrainzArtistId: string }, string | null>(
        spotifyArtistIdByMusicBrainzId as unknown as RegisteredAction,
        { musicBrainzArtistId: "mbid-1" },
      ),
    ).resolves.toBeNull();
  });

  it("trims musicbrainz ids before reading through the cache", async () => {
    mockSpotifyArtistIdByMusicBrainzIdFetch.mockResolvedValueOnce("artist-1");
    const { spotifyArtistIdByMusicBrainzId } = await import("./artists");

    await expect(
      runAction<{ musicBrainzArtistId: string }, string | null>(
        spotifyArtistIdByMusicBrainzId as unknown as RegisteredAction,
        { musicBrainzArtistId: "  mbid-1  " },
      ),
    ).resolves.toBe("artist-1");

    expect(mockSpotifyArtistIdByMusicBrainzIdFetch).toHaveBeenCalledWith(
      expect.anything(),
      { musicBrainzArtistId: "mbid-1" },
    );
  });
});
