import type { TrackSnapshot } from "@shared/track";

export interface Track {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  durationMs: number;
}

export interface SpotifyTrack extends Track {
  albumName: string;
  topStreak?: { count: number; userName: string | null } | null;
  difficulty?: number;
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

export interface MusicBrainzArtist {
  id: string;
  name: string;
  sortName: string | null;
  type: string | null;
  country: string | null;
  disambiguation: string | null;
  spotifyUrl: string;
  musicBrainzUrl: string;
}

export interface MusicBrainzArtistLinks {
  homepage: string | null;
  instagram: string | null;
  youtube: string | null;
  bandcamp: string | null;
}

export interface MusicBrainzArtistMatch {
  spotifyArtistId: string;
  spotifyUrl: string;
  resolvedVia: "spotify_url";
  matchCount: number;
  artist: MusicBrainzArtist;
  links: MusicBrainzArtistLinks;
}

export interface LastFmArtistStats {
  listeners: number | null;
  playcount: number | null;
}

export interface LastFmArtistBio {
  summary: string | null;
  published: string | null;
}

export interface LastFmArtistTag {
  name: string;
  url: string | null;
}

export interface LastFmSimilarArtist {
  name: string;
  musicBrainzId: string | null;
  url: string | null;
}

export interface LastFmArtistMatch {
  artistName: string;
  musicBrainzId: string | null;
  resolvedVia: "musicbrainz_id" | "artist_name";
  lastFmUrl: string | null;
  stats: LastFmArtistStats;
  bio: LastFmArtistBio;
  topTags: LastFmArtistTag[];
  similarArtists: LastFmSimilarArtist[];
}

export type { TrackSnapshot };

export interface StreakData extends TrackSnapshot {
  id: string;
  count: number;
  active: boolean;
  hardcore?: boolean;
  startedAt: string;
  userName?: string;
  userImage?: string;
}
