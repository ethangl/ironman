/**
 * Provider-neutral track identity. `id` is the *provider* track id; `isrc` is
 * the cross-service recording id (absent for simplified album-track objects).
 * The playback abstraction drives sync off this narrow shape.
 */
export interface CanonicalTrack {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  durationMs: number;
  isrc?: string;
}

/** A catalog track enriched with its album name, as the browse/search UI shows. */
export interface Track extends CanonicalTrack {
  albumName: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string | null;
  followerCount: number;
  genres: string[];
}

export interface AlbumRelease {
  id: string;
  name: string;
  image: string | null;
  releaseDate: string | null;
  totalTracks: number;
  albumType: string | null;
}

export interface AlbumArtist {
  id: string;
  name: string;
}

export interface AlbumDetails {
  id: string;
  name: string;
  image: string | null;
  releaseDate: string | null;
  totalTracks: number;
  albumType: string | null;
  artists: AlbumArtist[];
  tracks: Track[];
}

export type ArtistReleaseGroup = "album" | "single";

export interface PageInfo {
  offset: number;
  limit: number;
  total: number;
  nextOffset: number | null;
  hasMore: boolean;
}

export interface Page<T> extends PageInfo {
  items: T[];
}

export interface CursorPageInfo<TCursor extends string | number> {
  limit: number;
  total: number;
  nextCursor: TCursor | null;
  hasMore: boolean;
}

export interface CursorPage<T, TCursor extends string | number>
  extends CursorPageInfo<TCursor> {
  items: T[];
}

export type FavoriteArtistsPage = CursorPage<Artist, string>;

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  owner: string | null;
  public: boolean;
  trackCount: number;
  tracks?: Track[] | null;
}

export interface SearchResults {
  tracks: Track[];
  artists: Artist[];
}

export interface ArtistPageData {
  artist: Artist;
  topTracks: Track[];
  albums: Page<AlbumRelease>;
  singles: Page<AlbumRelease>;
}

export interface RecentTrack {
  playedAt: string;
  track: Track;
}

export type RecentlyPlayedPage = CursorPage<RecentTrack, number>;

export interface RecentlyPlayedPageResult {
  page: RecentlyPlayedPage;
  rateLimited: boolean;
}
