import type { SpotifyArtist } from "@/types";
import type { Playlist, RecentTrack } from "@/types/spotify-activity";

const PLAYLIST_PAGE_SIZE = 50;

export interface PlaylistsPage {
  items: Playlist[];
  total: number;
}

export interface RecentlyPlayedResult {
  items: RecentTrack[];
  rateLimited: boolean;
}

export interface SpotifyActivitySnapshot {
  recentlyPlayed: RecentlyPlayedResult;
  playlistsPage: PlaylistsPage;
  favoriteArtists: SpotifyArtist[];
}

export { PLAYLIST_PAGE_SIZE };
