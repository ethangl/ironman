import type { Playlist, RecentlyPlayedPage } from "./types";

const PLAYLIST_PAGE_SIZE = 50;
const RECENTLY_PLAYED_LIMIT = 10;

export interface PlaylistsPage {
  items: Playlist[];
  total: number;
}

export interface RecentlyPlayedPageResult {
  page: RecentlyPlayedPage;
  rateLimited: boolean;
}

export { PLAYLIST_PAGE_SIZE, RECENTLY_PLAYED_LIMIT };
