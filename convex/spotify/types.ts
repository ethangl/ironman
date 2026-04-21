export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumImage: string | null;
  durationMs: number;
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

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  owner: string | null;
  public: boolean;
  trackCount: number;
}

export interface SpotifyPlaylistsPage {
  items: SpotifyPlaylist[];
  total: number;
}

export interface SpotifyRecentlyPlayedItem {
  playedAt: string;
  track: SpotifyTrack;
}

export interface SpotifyRecentlyPlayedResult {
  items: SpotifyRecentlyPlayedItem[];
  rateLimited: boolean;
}

export interface SpotifySearchResults {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  playlists: SpotifyPlaylist[];
}

export interface SpotifyArtistPageData {
  artist: SpotifyArtist;
  topTracks: SpotifyTrack[];
  albums: SpotifyAlbumRelease[];
  singles: SpotifyAlbumRelease[];
}

export interface PlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { name: string }[];
  } | null;
}

export interface PlaybackResult {
  ok: boolean;
  retryAfterSeconds?: number;
  status: number;
}

export interface PlaybackCurrentlyPlayingResult {
  retryAfterSeconds?: number;
  status: number;
  playback: PlaybackState | null;
}
