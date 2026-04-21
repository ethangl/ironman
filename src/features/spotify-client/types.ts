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
  albums: SpotifyAlbumRelease[];
  singles: SpotifyAlbumRelease[];
}

export interface RecentTrack {
  playedAt: string;
  track: SpotifyTrack;
}

export type Playlist = SpotifyPlaylist & {
  tracks?: SpotifyTrack[] | null;
};
