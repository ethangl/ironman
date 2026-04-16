import type { SpotifyArtist } from "@/types";
import type { Playlist, RecentTrack } from "@/types/spotify-activity";

const PLAYLIST_PAGE_SIZE = 50;
const RECENTLY_PLAYED_LIMIT = 30;

export interface PlaylistsPage {
  items: Playlist[];
  total: number;
}

export interface RecentlyPlayedResult {
  items: RecentTrack[];
  rateLimited: boolean;
}

export { PLAYLIST_PAGE_SIZE, RECENTLY_PLAYED_LIMIT };
