export interface Track {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  durationMs: number;
}

export type PlayableTrack = Track;

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
  releases: SpotifyAlbumRelease[];
}

/** Track info as stored in the DB (track-prefixed fields). */
export interface TrackInfo {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
}

export type TrackLike = Track | TrackInfo;

export function isTrackInfo(track: TrackLike): track is TrackInfo {
  return "trackId" in track;
}

export function toTrack(track: TrackLike): Track {
  if (!isTrackInfo(track)) {
    return track;
  }

  return {
    id: track.trackId,
    name: track.trackName,
    artist: track.trackArtist,
    albumImage: track.trackImage,
    durationMs: track.trackDuration,
  };
}

export function toTrackInfo(track: TrackLike): TrackInfo {
  if (isTrackInfo(track)) {
    return track;
  }

  return {
    trackId: track.id,
    trackName: track.name,
    trackArtist: track.artist,
    trackImage: track.albumImage,
    trackDuration: track.durationMs,
  };
}

export interface PlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string; width: number; height: number }[];
    };
  } | null;
}

export interface StreakData extends TrackInfo {
  id: string;
  count: number;
  active: boolean;
  hardcore?: boolean;
  startedAt: string;
  userName?: string;
  userImage?: string;
}
