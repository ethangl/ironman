import { afterEach, describe, expect, it, vi } from "vitest";

import { LastFmApiError } from "./errors";

const mockFetch = vi.fn();

vi.mock("./caches", () => ({
  artistDetailsCache: {
    fetch: mockFetch,
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

describe("lastfm artistDetails", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no lookup input is provided", async () => {
    const { artistDetails } = await import("./artists");

    await expect(
      runAction<
        { apiKey: string; artistName: string | null; musicBrainzId: string | null },
        null
      >(artistDetails as unknown as RegisteredAction, {
        apiKey: "api-key",
        artistName: "   ",
        musicBrainzId: null,
      }),
    ).resolves.toBeNull();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("normalizes the artist name before reading through the cache", async () => {
    const cached = {
      artistName: "Aphex Twin",
      musicBrainzId: "artist-mbid-1",
      resolvedVia: "artist_name" as const,
      lastFmUrl: "https://www.last.fm/music/Aphex+Twin",
      stats: {
        listeners: 12345,
        playcount: 67890,
      },
      bio: {
        summary: "Richard D. James is an electronic artist.",
        published: "12 Jan 2020, 10:00",
      },
      topTags: [],
      similarArtists: [],
    };
    mockFetch.mockResolvedValueOnce(cached);
    const { artistDetails } = await import("./artists");

    await expect(
      runAction<
        { apiKey: string; artistName: string | null; musicBrainzId: string | null },
        typeof cached
      >(artistDetails as unknown as RegisteredAction, {
        apiKey: "api-key",
        artistName: "  Aphex   Twin  ",
        musicBrainzId: null,
      }),
    ).resolves.toEqual(cached);

    expect(mockFetch).toHaveBeenCalledWith(expect.anything(), {
      apiKey: "api-key",
      artistName: "aphex twin",
      musicBrainzId: null,
    });
  });

  it("maps Last.fm failures to the user-facing lookup error", async () => {
    mockFetch.mockRejectedValueOnce(new LastFmApiError(500, null, "boom"));
    const { artistDetails } = await import("./artists");

    await expect(
      runAction(artistDetails as unknown as RegisteredAction, {
        apiKey: "api-key",
        artistName: "Aphex Twin",
        musicBrainzId: null,
      }),
    ).rejects.toThrow("Could not load Last.fm artist details right now.");
  });
});
