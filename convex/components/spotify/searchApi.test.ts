import { afterEach, describe, expect, it, vi } from "vitest";

import { getAlbumTracks, getArtistPageData, searchSpotify } from "./searchApi";

describe("searchSpotify", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("filters out null search items returned by Spotify", async () => {
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
      playlists: [
        {
          id: "playlist-1",
          name: "Playlist One",
          description: null,
          image: "playlist.jpg",
          owner: "User One",
          public: true,
          trackCount: 20,
        },
      ],
    });
  });
});

describe("getArtistPageData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses search to find artist tracks and the albums endpoint for releases", async () => {
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
                },
                {
                  id: "track-2",
                  name: "Wrong Artist Song",
                  artists: [{ id: "artist-2", name: "Neurosis" }],
                  album: { name: "Enemy", images: [{ url: "wrong.jpg" }] },
                  duration_ms: 300000,
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
          id: "track-1",
          name: "Weight",
          artist: "ISIS, Guest",
          albumName: "Panopticon",
          albumImage: "track.jpg",
          durationMs: 640000,
        },
      ],
      releases: [
        {
          id: "album-1",
          name: "Oceanic",
          image: "album.jpg",
          releaseDate: "2002-09-28",
          totalTracks: 8,
          albumType: "album",
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toContain("market=US");
    expect(fetchMock.mock.calls[2]?.[0]).toContain("market=US");
  });
});

describe("getAlbumTracks", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
