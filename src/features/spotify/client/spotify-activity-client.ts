import type { PlaylistTrack } from "@/types/spotify-activity";
import { api } from "@api";
import {
  PLAYLIST_PAGE_SIZE,
  type ActivityBootstrap,
  type PlaylistsPage,
  type RecentlyPlayedResult,
} from "./spotify-activity";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

const TOP_ARTISTS_LIMIT = 10;

export interface SpotifyActivityClient {
  getFavoriteArtists: (
    limit?: number,
  ) => Promise<ActivityBootstrap["favoriteArtists"]>;
  getRecentlyPlayed: () => Promise<RecentlyPlayedResult>;
  getPlaylistsPage: (limit?: number, offset?: number) => Promise<PlaylistsPage>;
  getPlaylistTracks: (playlistId: string) => Promise<PlaylistTrack[]>;
  getTopArtists: (
    limit?: number,
  ) => Promise<ActivityBootstrap["favoriteArtists"]>;
  loadBootstrap: () => Promise<ActivityBootstrap>;
}

async function loadSpotifyActivityBootstrap(): Promise<ActivityBootstrap> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.activityBootstrap, {
    playlistLimit: PLAYLIST_PAGE_SIZE,
    playlistOffset: 0,
    topArtistsLimit: TOP_ARTISTS_LIMIT,
    recentlyPlayedLimit: 50,
  });
}

export function createSpotifyActivityClient(): SpotifyActivityClient {
  return {
    async getFavoriteArtists(limit = 50) {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.favoriteArtists, {
        limit,
      });
    },
    async getRecentlyPlayed() {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.recentlyPlayed, {
        limit: 50,
      });
    },
    async getPlaylistsPage(limit = PLAYLIST_PAGE_SIZE, offset = 0) {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.playlistsPage, {
        limit,
        offset,
      });
    },
    async getPlaylistTracks(playlistId) {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.playlistTracks, {
        playlistId,
      });
    },
    async getTopArtists(limit = TOP_ARTISTS_LIMIT) {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.topArtists, {
        limit,
      });
    },
    loadBootstrap: loadSpotifyActivityBootstrap,
  };
}

export const spotifyActivityClient = createSpotifyActivityClient();
