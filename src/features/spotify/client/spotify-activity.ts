import type {
  FavoriteArtist,
  Playlist,
  RecentTrack,
} from "@/types/spotify-activity";

const PLAYLIST_PAGE_SIZE = 50;

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
