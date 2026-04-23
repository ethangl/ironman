import type { Playlist, RecentlyPlayedPage, SpotifyPage } from "./types";

const PLAYLIST_PAGE_SIZE = 10;
const RECENTLY_PLAYED_LIMIT = 10;

export type PlaylistsPage = SpotifyPage<Playlist>;

export interface RecentlyPlayedPageResult {
  page: RecentlyPlayedPage;
  rateLimited: boolean;
}

export { PLAYLIST_PAGE_SIZE, RECENTLY_PLAYED_LIMIT };
