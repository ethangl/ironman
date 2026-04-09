import {
  FavoriteArtist,
  Playlist,
  PlaylistTrack,
  RecentTrack,
} from "@/hooks/use-spotify-activity";

import { getRouteErrorMessage } from "@/data/http";

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

async function parseJsonSafe<T>(response: Response, fallback: T) {
  return response.json().catch(() => fallback) as Promise<T>;
}

export async function getRecentlyPlayedActivity(): Promise<RecentlyPlayedResult> {
  const response = await fetch("/api/recently-played");
  if (!response.ok) {
    return { items: [], rateLimited: false };
  }

  return {
    items: await parseJsonSafe<RecentTrack[]>(response, []),
    rateLimited: response.headers.get("x-spotify-rate-limited") === "1",
  };
}

export async function getPlaylistsPage(
  limit = PLAYLIST_PAGE_SIZE,
  offset = 0,
): Promise<PlaylistsPage> {
  const response = await fetch(`/api/playlists?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    return { items: [], total: 0 };
  }

  return parseJsonSafe<PlaylistsPage>(response, { items: [], total: 0 });
}

export async function getPlaylistTracksById(
  playlistId: string,
): Promise<PlaylistTrack[]> {
  const response = await fetch(`/api/playlists/${playlistId}`);
  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => ({ error: "Could not load playlist tracks." }));

    throw new Error(
      getRouteErrorMessage(data, "Could not load playlist tracks."),
    );
  }

  const data = await parseJsonSafe<{ items: PlaylistTrack[] }>(response, {
    items: [],
  });
  return data.items ?? [];
}

export async function getTopArtistsActivity(
  limit = TOP_ARTISTS_LIMIT,
): Promise<FavoriteArtist[]> {
  const response = await fetch(`/api/top-artists?limit=${limit}`);
  if (!response.ok) {
    return [];
  }

  return parseJsonSafe<FavoriteArtist[]>(response, []);
}
