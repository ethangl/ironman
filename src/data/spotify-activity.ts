import {
  FavoriteArtist,
  Playlist,
  PlaylistTrack,
  RecentTrack,
} from "@/hooks/use-spotify-activity";

import { authClient } from "@/lib/auth-client";
import {
  getPlaylistTracks,
  getRecentlyPlayed,
  getTopArtists,
  getUserPlaylists,
  SpotifyApiError,
} from "@/lib/spotify";

const PLAYLIST_PAGE_SIZE = 50;
const TOP_ARTISTS_LIMIT = 10;

export interface PlaylistsPage {
  items: Playlist[];
  total: number;
}

export interface RecentlyPlayedResult {
  items: RecentTrack[];
  rateLimited: boolean;
}

export interface ActivityBootstrap {
  favoriteArtists: FavoriteArtist[];
  playlists: Playlist[];
  playlistsTotal: number;
  recentTracks: RecentTrack[];
}

export { PLAYLIST_PAGE_SIZE };

async function getSpotifyClientAccessToken() {
  const accessToken = await authClient.getAccessToken({
    providerId: "spotify",
  });

  return accessToken?.data?.accessToken ?? null;
}

export async function getRecentlyPlayedActivity(): Promise<RecentlyPlayedResult> {
  const token = await getSpotifyClientAccessToken();
  if (!token) {
    throw new Error("Reconnect Spotify to load your recent tracks.");
  }

  try {
    return {
      items: await getRecentlyPlayed(token),
      rateLimited: false,
    };
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 429) {
      return {
        items: [],
        rateLimited: true,
      };
    }

    throw error;
  }
}

export async function getPlaylistsPage(
  limit = PLAYLIST_PAGE_SIZE,
  offset = 0,
): Promise<PlaylistsPage> {
  const token = await getSpotifyClientAccessToken();
  if (!token) {
    throw new Error("Reconnect Spotify to load your playlists.");
  }

  try {
    return await getUserPlaylists(token, limit, offset);
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getPlaylistTracksById(
  playlistId: string,
): Promise<PlaylistTrack[]> {
  const token = await getSpotifyClientAccessToken();
  if (!token) {
    throw new Error("Reconnect Spotify to load playlist tracks.");
  }

  try {
    return await getPlaylistTracks(token, playlistId);
  } catch {
    throw new Error("Could not load playlist tracks.");
  }
}

export async function getTopArtistsActivity(
  limit = TOP_ARTISTS_LIMIT,
): Promise<FavoriteArtist[]> {
  const token = await getSpotifyClientAccessToken();
  if (!token) {
    throw new Error("Reconnect Spotify to load your top artists.");
  }

  try {
    return await getTopArtists(token, limit);
  } catch {
    return [];
  }
}
