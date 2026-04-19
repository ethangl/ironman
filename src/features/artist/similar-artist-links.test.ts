import { describe, expect, it, beforeEach } from "vitest";

import {
  cacheSpotifyArtistIdForMusicBrainzArtist,
  getCachedSpotifyArtistIdForMusicBrainzArtist,
  getSimilarArtistLink,
  normalizeLastFmUrl,
} from "./similar-artist-links";

describe("normalizeLastFmUrl", () => {
  it("normalizes scheme-less last.fm urls", () => {
    expect(normalizeLastFmUrl("www.last.fm/music/Aphex+Twin")).toBe(
      "https://www.last.fm/music/Aphex+Twin",
    );
  });

  it("rejects non-last.fm urls", () => {
    expect(normalizeLastFmUrl("https://example.com/artist")).toBeNull();
  });
});

describe("similar artist links", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses a direct internal artist route when a cached spotify id exists", () => {
    cacheSpotifyArtistIdForMusicBrainzArtist("mbid-1", "spotify-1");

    expect(getCachedSpotifyArtistIdForMusicBrainzArtist("mbid-1")).toBe(
      "spotify-1",
    );
    expect(
      getSimilarArtistLink({
        name: "AFX",
        musicBrainzId: "mbid-1",
        url: "https://www.last.fm/music/AFX",
      }),
    ).toEqual({
      href: "/artist/spotify-1",
      external: false,
    });
  });

  it("builds a resolver route when the artist has a MusicBrainz id but no cached spotify id", () => {
    expect(
      getSimilarArtistLink({
        name: "AFX",
        musicBrainzId: "mbid-1",
        url: "www.last.fm/music/AFX",
      }),
    ).toEqual({
      href:
        "/artist/resolve/mbid-1?fallback=https%3A%2F%2Fwww.last.fm%2Fmusic%2FAFX&name=AFX",
      external: false,
    });
  });

  it("falls back to the normalized Last.fm url when there is no MusicBrainz id", () => {
    expect(
      getSimilarArtistLink({
        name: "AFX",
        musicBrainzId: null,
        url: "www.last.fm/music/AFX",
      }),
    ).toEqual({
      href: "https://www.last.fm/music/AFX",
      external: true,
    });
  });
});
