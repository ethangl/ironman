export interface Track {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  durationMs: number;
}

export interface SpotifyTrack extends Track {
  albumName: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  image: string | null;
  followerCount: number;
  genres: string[];
}

export interface SpotifyAlbumRelease {
  id: string;
  name: string;
  image: string | null;
  releaseDate: string | null;
  totalTracks: number;
  albumType: string | null;
}

export type SpotifyArtistReleaseGroup = "album" | "single";

export interface SpotifyPageInfo {
  offset: number;
  limit: number;
  total: number;
  nextOffset: number | null;
  hasMore: boolean;
}

export interface SpotifyPage<T> extends SpotifyPageInfo {
  items: T[];
}

export interface SpotifyCursorPageInfo<TCursor extends string | number> {
  limit: number;
  total: number;
  nextCursor: TCursor | null;
  hasMore: boolean;
}

export interface SpotifyCursorPage<T, TCursor extends string | number>
  extends SpotifyCursorPageInfo<TCursor> {
  items: T[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  owner: string | null;
  public: boolean;
  trackCount: number;
}

export interface SpotifySearchResults {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  playlists: SpotifyPlaylist[];
}

export interface SpotifyArtistPageData {
  artist: SpotifyArtist;
  topTracks: SpotifyTrack[];
  albums: SpotifyPage<SpotifyAlbumRelease>;
  singles: SpotifyPage<SpotifyAlbumRelease>;
}

export interface RecentTrack {
  playedAt: string;
  track: SpotifyTrack;
}

export type RecentlyPlayedPage = SpotifyCursorPage<RecentTrack, number>;

export interface RecentlyPlayedPageResult {
  page: RecentlyPlayedPage;
  rateLimited: boolean;
}

export type Playlist = SpotifyPlaylist & {
  tracks?: SpotifyTrack[] | null;
};
