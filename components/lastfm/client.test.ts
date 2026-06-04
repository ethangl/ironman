import { afterEach, describe, expect, it, vi } from "vitest";

import { lookupArtistByMusicBrainzId, lookupArtistByName } from "./client";

describe("lookupArtistByMusicBrainzId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when Last.fm cannot find the artist", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 6,
          message: "The artist you supplied could not be found",
        }),
        { status: 200 },
      ),
    );

    await expect(
      lookupArtistByMusicBrainzId("api-key", "mbid-missing"),
    ).resolves.toBeNull();
  });

  it("maps Last.fm artist metadata from a MusicBrainz lookup", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            artist: {
              name: "Aphex Twin",
              mbid: "artist-mbid-1",
              url: "https://www.last.fm/music/Aphex+Twin",
              stats: {
                listeners: "12345",
                playcount: "67890",
              },
              bio: {
                published: "12 Jan 2020, 10:00",
                summary:
                  "Richard D. James is an electronic artist. <a href=\"https://www.last.fm/music/Aphex+Twin\">Read more on Last.fm</a>",
              },
              tags: {
                tag: [
                  {
                    name: "idm",
                    url: "https://www.last.fm/tag/idm",
                  },
                  {
                    name: "electronic",
                    url: "https://www.last.fm/tag/electronic",
                  },
                ],
              },
              similar: {
                artist: [
                  {
                    name: "Autechre",
                    url: "https://www.last.fm/music/Autechre",
                  },
                ],
              },
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            similarartists: {
              artist: [
                {
                  name: "Autechre",
                  mbid: "artist-mbid-2",
                  url: "https://www.last.fm/music/Autechre",
                },
                {
                  name: "Boards of Canada",
                  mbid: "artist-mbid-3",
                  url: "https://www.last.fm/music/Boards+of+Canada",
                },
              ],
            },
          }),
          { status: 200 },
        ),
      );

    await expect(
      lookupArtistByMusicBrainzId("api-key", "artist-mbid-1"),
    ).resolves.toEqual({
      artistName: "Aphex Twin",
      musicBrainzId: "artist-mbid-1",
      resolvedVia: "musicbrainz_id",
      lastFmUrl: "https://www.last.fm/music/Aphex+Twin",
      stats: {
        listeners: 12345,
        playcount: 67890,
      },
      bio: {
        summary: "Richard D. James is an electronic artist.",
        published: "12 Jan 2020, 10:00",
      },
      topTags: [
        {
          name: "idm",
          url: "https://www.last.fm/tag/idm",
        },
        {
          name: "electronic",
          url: "https://www.last.fm/tag/electronic",
        },
      ],
      similarArtists: [
        {
          name: "Autechre",
          musicBrainzId: "artist-mbid-2",
          url: "https://www.last.fm/music/Autechre",
        },
        {
          name: "Boards of Canada",
          musicBrainzId: "artist-mbid-3",
          url: "https://www.last.fm/music/Boards+of+Canada",
        },
      ],
    });
  });
});

describe("lookupArtistByName", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses artist-name lookups with autocorrect enabled", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            artist: {
              name: "Aphex Twin",
              mbid: "artist-mbid-1",
              url: "https://www.last.fm/music/Aphex+Twin",
              stats: {},
              bio: {},
              tags: { tag: [] },
              similar: { artist: [] },
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            similarartists: { artist: [] },
          }),
          { status: 200 },
        ),
      );

    await expect(lookupArtistByName("api-key", "aphex twin")).resolves.toEqual({
      artistName: "Aphex Twin",
      musicBrainzId: "artist-mbid-1",
      resolvedVia: "artist_name",
      lastFmUrl: "https://www.last.fm/music/Aphex+Twin",
      stats: {
        listeners: null,
        playcount: null,
      },
      bio: {
        summary: null,
        published: null,
      },
      topTags: [],
      similarArtists: [],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0]?.[0]).toContain("artist=aphex+twin");
    expect(fetchSpy.mock.calls[0]?.[0]).toContain("autocorrect=1");
    expect(fetchSpy.mock.calls[1]?.[0]).toContain("method=artist.getsimilar");
  });
});
