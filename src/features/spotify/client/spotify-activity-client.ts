import type { SpotifyArtist, SpotifyTrack } from "@/types";
import { api } from "@api";
import {
  PLAYLIST_PAGE_SIZE,
  type PlaylistsPage,
  type RecentlyPlayedResult,
} from "./spotify-activity";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

const TOP_ARTISTS_LIMIT = 10;

export interface SpotifyActivityClient {
  getFavoriteArtists: (limit?: number) => Promise<SpotifyArtist[]>;
  getRecentlyPlayed: () => Promise<RecentlyPlayedResult>;
  getPlaylistsPage: (limit?: number, offset?: number) => Promise<PlaylistsPage>;
  getPlaylistTracks: (playlistId: string) => Promise<SpotifyTrack[]>;
  getTopArtists: (limit?: number) => Promise<SpotifyArtist[]>;
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
  };
}

export const spotifyActivityClient = createSpotifyActivityClient();
