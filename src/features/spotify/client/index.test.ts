import { describe, expect, it, vi } from "vitest";

import type { ArtistsClient } from "./artists-client";
import { createSpotifyClient, defaultSpotifyClient } from ".";
import type { SearchClient } from "./search-client";
import type { SpotifyActivityClient } from "./spotify-activity-client";

describe("createSpotifyClient", () => {
  it("uses the default slice clients when no overrides are given", () => {
    const client = createSpotifyClient();

    expect(client.artists).toBe(defaultSpotifyClient.artists);
    expect(client.search).toBe(defaultSpotifyClient.search);
    expect(client.spotifyActivity).toBe(defaultSpotifyClient.spotifyActivity);
  });

  it("lets individual slices be swapped without rebuilding the full client", () => {
    const artistsOverride: ArtistsClient = {
      getPageData: vi.fn().mockResolvedValue(null),
    };
    const searchOverride: SearchClient = {
      searchResults: vi.fn().mockResolvedValue({}),
      searchTracks: vi.fn().mockResolvedValue([]),
    };
    const spotifyActivityOverride: SpotifyActivityClient = {
      getFavoriteArtists: vi.fn().mockResolvedValue([]),
      getRecentlyPlayed: vi
        .fn()
        .mockResolvedValue({ items: [], rateLimited: false }),
      getPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      getPlaylistTracks: vi.fn().mockResolvedValue([]),
      getTopArtists: vi.fn().mockResolvedValue([]),
      loadBootstrap: vi.fn().mockResolvedValue({
        favoriteArtists: [],
        playlists: [],
        playlistsTotal: 0,
        recentTracks: [],
      }),
    };

    const client = createSpotifyClient({
      artists: artistsOverride,
      search: searchOverride,
      spotifyActivity: spotifyActivityOverride,
    });

    expect(client.artists).toBe(artistsOverride);
    expect(client.search).toBe(searchOverride);
    expect(client.spotifyActivity).toBe(spotifyActivityOverride);
  });
});
