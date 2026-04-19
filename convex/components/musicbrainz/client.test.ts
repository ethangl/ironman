import { afterEach, describe, expect, it, vi } from "vitest";

import {
  lookupArtistBySpotifyId,
  lookupArtistLinksByArtistId,
  lookupSpotifyArtistIdByMusicBrainzArtistId,
} from "./client";

describe("lookupArtistBySpotifyId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when MusicBrainz has no URL match for the Spotify artist", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("", { status: 404 }),
    );

    await expect(lookupArtistBySpotifyId("artist-missing")).resolves.toBeNull();
  });

  it("maps the first artist relation and reports the number of matches", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          resource: "https://open.spotify.com/artist/artist-1",
          relations: [
            {
              "target-type": "artist",
              artist: {
                id: "mbid-1",
                name: "ISIS",
                "sort-name": "ISIS",
                type: "Group",
                country: "US",
                disambiguation: "American post-metal band",
              },
            },
            {
              "target-type": "artist",
              artist: {
                id: "mbid-2",
                name: "Isis",
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(lookupArtistBySpotifyId("artist-1")).resolves.toEqual({
      spotifyArtistId: "artist-1",
      spotifyUrl: "https://open.spotify.com/artist/artist-1",
      resolvedVia: "spotify_url",
      matchCount: 2,
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
    });
  });

  it("ignores non-artist relations and malformed artist payloads", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          resource: "https://open.spotify.com/artist/artist-1",
          relations: [
            {
              "target-type": "url",
            },
            {
              "target-type": "artist",
              artist: {
                id: 42,
                name: "Broken",
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(lookupArtistBySpotifyId("artist-1")).resolves.toBeNull();
  });
});

describe("lookupArtistLinksByArtistId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts homepage, instagram, and youtube links from url relations", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          relations: [
            {
              type: "official homepage",
              url: { resource: "https://isis-official.example/" },
            },
            {
              type: "social network",
              url: { resource: "https://www.instagram.com/isisband/" },
            },
            {
              type: "youtube",
              url: { resource: "https://www.youtube.com/@isisband" },
            },
            {
              type: "social network",
              url: { resource: "https://twitter.com/isisband" },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(lookupArtistLinksByArtistId("mbid-1")).resolves.toEqual({
      homepage: "https://isis-official.example/",
      instagram: "https://www.instagram.com/isisband/",
      youtube: "https://www.youtube.com/@isisband",
      bandcamp: null,
    });
  });

  it("returns empty links when the artist lookup is missing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("", { status: 404 }),
    );

    await expect(lookupArtistLinksByArtistId("missing")).resolves.toEqual({
      homepage: null,
      instagram: null,
      youtube: null,
      bandcamp: null,
    });
  });

  it("extracts a bandcamp link from dedicated Bandcamp relations", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          relations: [
            {
              type: "bandcamp",
              url: { resource: "https://isis.bandcamp.com/" },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(lookupArtistLinksByArtistId("mbid-1")).resolves.toEqual({
      homepage: null,
      instagram: null,
      youtube: null,
      bandcamp: "https://isis.bandcamp.com/",
    });
  });
});

describe("lookupSpotifyArtistIdByMusicBrainzArtistId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts a spotify artist id from artist url relations", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          relations: [
            {
              type: "stream for free",
              url: {
                resource: "https://open.spotify.com/artist/spotify-artist-1",
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(
      lookupSpotifyArtistIdByMusicBrainzArtistId("mbid-1"),
    ).resolves.toBe("spotify-artist-1");
  });

  it("returns null when the artist has no spotify relationship", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          relations: [
            {
              type: "official homepage",
              url: { resource: "https://artist.example/" },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(
      lookupSpotifyArtistIdByMusicBrainzArtistId("mbid-1"),
    ).resolves.toBeNull();
  });
});
