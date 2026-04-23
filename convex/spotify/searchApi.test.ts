import { afterEach, describe, expect, it, vi } from "vitest";

import { getAlbum, getAlbumTracks } from "./albums";
import {
  getArtistPageData,
  getArtistPageDataResult,
  getArtistReleasesPage,
} from "./artists";
import { searchSpotify } from "./search";

describe("searchSpotify", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("filters out null search items returned by Spotify while ignoring playlists", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          tracks: {
            items: [
              {
                id: "track-1",
                name: "Track One",
                artists: [{ id: "artist-1", name: "Artist One" }],
                album: { name: "Album One", images: [{ url: "cover.jpg" }] },
                duration_ms: 180000,
              },
              null,
            ],
          },
          artists: {
            items: [
              {
                id: "artist-1",
                name: "Artist One",
                images: [{ url: "artist.jpg" }],
                followers: { total: 1234 },
                genres: ["metal"],
              },
              null,
            ],
          },
          playlists: {
            items: [
              null,
              {
                id: "playlist-1",
                name: "Playlist One",
                description: null,
                images: [{ url: "playlist.jpg" }],
                owner: { display_name: "User One" },
                public: true,
                items: { total: 20 },
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const results = await searchSpotify("isis", "spotify-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/search?q=isis&type=track,artist&limit=6",
      expect.any(Object),
    );

    expect(results).toEqual({
      tracks: [
        {
          id: "track-1",
          name: "Track One",
          artist: "Artist One",
          albumName: "Album One",
          albumImage: "cover.jpg",
          durationMs: 180000,
        },
      ],
      artists: [
        {
          id: "artist-1",
          name: "Artist One",
          image: "artist.jpg",
          followerCount: 1234,
          genres: ["metal"],
        },
      ],
    });
  });
});

describe("getArtistPageData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads albums and singles separately while sorting top tracks by primary appearance and popularity", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "artist-1",
            name: "ISIS",
            images: [{ url: "artist.jpg" }],
            followers: { total: 1234 },
            genres: ["post-metal"],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tracks: {
              items: [
                {
                  id: "track-1",
                  name: "Weight",
                  artists: [
                    { id: "artist-1", name: "ISIS" },
                    { id: "artist-9", name: "Guest" },
                  ],
                  album: { name: "Panopticon", images: [{ url: "track.jpg" }] },
                  duration_ms: 640000,
                  popularity: 60,
                },
                {
                  id: "track-3",
                  name: "Celestial (Feature)",
                  artists: [
                    { id: "artist-9", name: "Guest" },
                    { id: "artist-1", name: "ISIS" },
                  ],
                  album: { name: "Collab", images: [{ url: "collab.jpg" }] },
                  duration_ms: 420000,
                  popularity: 95,
                },
                {
                  id: "track-4",
                  name: "In Fiction",
                  artists: [{ id: "artist-1", name: "ISIS" }],
                  album: {
                    name: "Panopticon",
                    images: [{ url: "fiction.jpg" }],
                  },
                  duration_ms: 500000,
                  popularity: 85,
                },
                {
                  id: "track-2",
                  name: "Wrong Artist Song",
                  artists: [{ id: "artist-2", name: "Neurosis" }],
                  album: { name: "Enemy", images: [{ url: "wrong.jpg" }] },
                  duration_ms: 300000,
                  popularity: 99,
                },
              ],
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id: "album-1",
                name: "Oceanic",
                album_type: "album",
                artists: [{ id: "artist-1", name: "ISIS" }],
                images: [{ url: "album.jpg" }],
                release_date: "2002-09-28",
                total_tracks: 8,
              },
            ],
            total: 12,
            limit: 10,
            offset: 0,
            next: "https://api.spotify.com/v1/artists/artist-1/albums?include_groups=album&limit=10&offset=10&market=US",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id: "single-1",
                name: "Holy Tears",
                album_type: "single",
                artists: [{ id: "artist-1", name: "ISIS" }],
                images: [{ url: "single.jpg" }],
                release_date: "2007-10-08",
                total_tracks: 2,
              },
            ],
            total: 1,
            limit: 10,
            offset: 0,
            next: null,
          }),
          { status: 200 },
        ),
      );

    const result = await getArtistPageData("spotify-token", "artist-1", "US");

    expect(result).toEqual({
      artist: {
        id: "artist-1",
        name: "ISIS",
        image: "artist.jpg",
        followerCount: 1234,
        genres: ["post-metal"],
      },
      topTracks: [
        {
          id: "track-4",
          name: "In Fiction",
          artist: "ISIS",
          albumName: "Panopticon",
          albumImage: "fiction.jpg",
          durationMs: 500000,
        },
        {
          id: "track-1",
          name: "Weight",
          artist: "ISIS, Guest",
          albumName: "Panopticon",
          albumImage: "track.jpg",
          durationMs: 640000,
        },
        {
          id: "track-3",
          name: "Celestial (Feature)",
          artist: "Guest, ISIS",
          albumName: "Collab",
          albumImage: "collab.jpg",
          durationMs: 420000,
        },
      ],
      albums: {
        items: [
          {
            id: "album-1",
            name: "Oceanic",
            image: "album.jpg",
            releaseDate: "2002-09-28",
            totalTracks: 8,
            albumType: "album",
          },
        ],
        offset: 0,
        limit: 10,
        total: 12,
        nextOffset: 10,
        hasMore: true,
      },
      singles: {
        items: [
          {
            id: "single-1",
            name: "Holy Tears",
            image: "single.jpg",
            releaseDate: "2007-10-08",
            totalTracks: 2,
            albumType: "single",
          },
        ],
        offset: 0,
        limit: 10,
        total: 1,
        nextOffset: null,
        hasMore: false,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[1]?.[0]).toContain("market=US");
    expect(fetchMock.mock.calls[1]?.[0]).toContain("limit=10");
    expect(fetchMock.mock.calls[2]?.[0]).toContain("include_groups=album");
    expect(fetchMock.mock.calls[2]?.[0]).toContain("market=US");
    expect(fetchMock.mock.calls[2]?.[0]).toContain("offset=0");
    expect(fetchMock.mock.calls[3]?.[0]).toContain("include_groups=single");
    expect(fetchMock.mock.calls[3]?.[0]).toContain("market=US");
    expect(fetchMock.mock.calls[3]?.[0]).toContain("offset=0");
  });

  it("marks artist page releases as fallback when the singles query fails", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "artist-1",
            name: "ISIS",
            images: [{ url: "artist.jpg" }],
            followers: { total: 1234 },
            genres: ["post-metal"],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tracks: {
              items: [
                {
                  id: "track-1",
                  name: "Weight",
                  artists: [{ id: "artist-1", name: "ISIS" }],
                  album: { name: "Panopticon", images: [{ url: "track.jpg" }] },
                  duration_ms: 640000,
                  popularity: 60,
                },
              ],
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id: "album-1",
                name: "Oceanic",
                album_type: "album",
                artists: [{ id: "artist-1", name: "ISIS" }],
                images: [{ url: "album.jpg" }],
                release_date: "2002-09-28",
                total_tracks: 8,
              },
            ],
            total: 1,
            limit: 10,
            offset: 0,
            next: null,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { status: 429, message: "rate limited" } }),
          {
            status: 429,
            headers: { "Retry-After": "30" },
          },
        ),
      );

    const result = await getArtistPageDataResult(
      "spotify-token",
      "artist-1",
      "US",
    );

    expect(result).toEqual({
      page: {
        artist: {
          id: "artist-1",
          name: "ISIS",
          image: "artist.jpg",
          followerCount: 1234,
          genres: ["post-metal"],
        },
        topTracks: [
          {
            id: "track-1",
            name: "Weight",
            artist: "ISIS",
            albumName: "Panopticon",
            albumImage: "track.jpg",
            durationMs: 640000,
          },
        ],
        albums: {
          items: [
            {
              id: "album-1",
              name: "Oceanic",
              image: "album.jpg",
              releaseDate: "2002-09-28",
              totalTracks: 8,
              albumType: "album",
            },
          ],
          offset: 0,
          limit: 10,
          total: 1,
          nextOffset: null,
          hasMore: false,
        },
        singles: {
          items: [],
          offset: 0,
          limit: 10,
          total: 0,
          nextOffset: null,
          hasMore: false,
        },
      },
      usedReleaseFallback: true,
    });
  });

  it("maps artist release pagination metadata for follow-up pages", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "album-11",
              name: "In the Absence of Truth",
              album_type: "album",
              artists: [{ id: "artist-1", name: "ISIS" }],
              images: [{ url: "absence.jpg" }],
              release_date: "2006-10-31",
              total_tracks: 11,
            },
          ],
          total: 23,
          limit: 10,
          offset: 10,
          next: "https://api.spotify.com/v1/artists/artist-1/albums?include_groups=album&limit=10&offset=20&market=US",
        }),
        { status: 200 },
      ),
    );

    const result = await getArtistReleasesPage("spotify-token", "artist-1", "album", {
      market: "US",
      limit: 10,
      offset: 10,
    });

    expect(result).toEqual({
      items: [
        {
          id: "album-11",
          name: "In the Absence of Truth",
          image: "absence.jpg",
          releaseDate: "2006-10-31",
          totalTracks: 11,
          albumType: "album",
        },
      ],
      offset: 10,
      limit: 10,
      total: 23,
      nextOffset: 20,
      hasMore: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("include_groups=album");
    expect(fetchMock.mock.calls[0]?.[0]).toContain("limit=10");
    expect(fetchMock.mock.calls[0]?.[0]).toContain("offset=10");
    expect(fetchMock.mock.calls[0]?.[0]).toContain("market=US");
  });
});

describe("getAlbumTracks", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps album details into a dedicated album payload", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "album-1",
          name: "Oceanic",
          images: [{ url: "album.jpg" }],
          album_type: "album",
          release_date: "2002-09-28",
          total_tracks: 8,
          artists: [
            { id: "artist-1", name: "ISIS" },
            { id: "artist-2", name: "Aereogramme" },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await getAlbum("spotify-token", "album-1");

    expect(result).toEqual({
      id: "album-1",
      name: "Oceanic",
      image: "album.jpg",
      releaseDate: "2002-09-28",
      totalTracks: 8,
      albumType: "album",
      artists: [
        { id: "artist-1", name: "ISIS" },
        { id: "artist-2", name: "Aereogramme" },
      ],
    });
  });

  it("returns null when Spotify does not find the album", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { status: 404, message: "nope" } }), {
        status: 404,
      }),
    );

    await expect(getAlbum("spotify-token", "missing")).resolves.toBeNull();
  });

  it("maps album track items using the parent album metadata", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "album-1",
          name: "Oceanic",
          images: [{ url: "album.jpg" }],
          album_type: "album",
          release_date: "2002-09-28",
          total_tracks: 8,
          artists: [{ id: "artist-1", name: "ISIS" }],
          tracks: {
            items: [
              {
                id: "track-1",
                name: "Weight",
                artists: [{ id: "artist-1", name: "ISIS" }],
                duration_ms: 640000,
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getAlbumTracks("spotify-token", "album-1");

    expect(result).toEqual([
      {
        id: "track-1",
        name: "Weight",
        artist: "ISIS",
        albumName: "Oceanic",
        albumImage: "album.jpg",
        durationMs: 640000,
      },
    ]);
  });
});
