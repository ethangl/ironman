import { describe, expect, it, vi } from "vitest";

import type { ArtistsClient } from "./artists-client";
import { createAppDataClient, defaultAppDataClient } from "./client";
import type { IronmanClient } from "./ironman-client";
import type { LeaderboardsClient } from "./leaderboards-client";
import type { PaletteClient } from "./palette-client";
import type { ProfileClient } from "./profile-client";
import type { SearchClient } from "./search-client";
import type { SongsClient } from "./songs-client";
import type { SpotifyActivityClient } from "./spotify-activity-client";

describe("createAppDataClient", () => {
  it("uses the default slice clients when no overrides are given", () => {
    const client = createAppDataClient();

    expect(client.profile).toBe(defaultAppDataClient.profile);
    expect(client.songs).toBe(defaultAppDataClient.songs);
    expect(client.artists).toBe(defaultAppDataClient.artists);
    expect(client.ironman).toBe(defaultAppDataClient.ironman);
    expect(client.leaderboards).toBe(defaultAppDataClient.leaderboards);
    expect(client.palette).toBe(defaultAppDataClient.palette);
    expect(client.search).toBe(defaultAppDataClient.search);
    expect(client.spotifyActivity).toBe(defaultAppDataClient.spotifyActivity);
  });

  it("lets individual slices be swapped without rebuilding the full client", () => {
    const profileOverride: ProfileClient = {
      getCurrent: vi.fn().mockResolvedValue(null),
      getPublic: vi.fn().mockResolvedValue(null),
    };
    const songsOverride: SongsClient = {
      getStats: vi.fn().mockResolvedValue(null),
    };
    const artistsOverride: ArtistsClient = {
      getPageData: vi.fn().mockResolvedValue(null),
    };
    const ironmanOverride: IronmanClient = {
      getStatus: vi.fn().mockResolvedValue(null),
      start: vi.fn().mockResolvedValue({
        id: "streak-1",
        trackId: "track-1",
        trackName: "Test Track",
        trackArtist: "Test Artist",
        trackImage: null,
        trackDuration: 123000,
        count: 1,
        active: true,
        hardcore: false,
        startedAt: "2026-04-09T00:00:00.000Z",
      }),
      activateHardcore: vi.fn().mockResolvedValue(undefined),
      surrender: vi.fn().mockResolvedValue(undefined),
      reportWeakness: vi.fn().mockResolvedValue(null),
      poll: vi.fn().mockResolvedValue({ count: 1 }),
    };
    const leaderboardOverride: LeaderboardsClient = {
      getGlobal: vi.fn().mockResolvedValue([]),
      getHome: vi.fn().mockResolvedValue({
        global: [],
        ironmen: [],
        bangers: [],
        hellscape: [],
      }),
      getTrack: vi.fn().mockResolvedValue({ leaderboard: [], myEntry: null }),
      getIronmen: vi.fn().mockResolvedValue([]),
      getBangers: vi.fn().mockResolvedValue([]),
      getBrutality: vi.fn().mockResolvedValue([]),
    };
    const paletteOverride: PaletteClient = {
      get: vi.fn().mockResolvedValue([]),
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

    const client = createAppDataClient({
      profile: profileOverride,
      songs: songsOverride,
      artists: artistsOverride,
      ironman: ironmanOverride,
      leaderboards: leaderboardOverride,
      palette: paletteOverride,
      search: searchOverride,
      spotifyActivity: spotifyActivityOverride,
    });

    expect(client.profile).toBe(profileOverride);
    expect(client.songs).toBe(songsOverride);
    expect(client.artists).toBe(artistsOverride);
    expect(client.ironman).toBe(ironmanOverride);
    expect(client.leaderboards).toBe(leaderboardOverride);
    expect(client.palette).toBe(paletteOverride);
    expect(client.search).toBe(searchOverride);
    expect(client.spotifyActivity).toBe(spotifyActivityOverride);
  });
});
