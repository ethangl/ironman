export interface PlayableTrack {
  id: string;
  name: string;
  artist: string;
  albumImage: string | null;
  durationMs: number;
}

export interface SpotifyTrack extends PlayableTrack {
  albumName: string;
  topStreak?: { count: number; userName: string | null } | null;
  difficulty?: number;
}

/** Track info as stored in the DB (track-prefixed fields). */
export interface TrackInfo {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
}

export function toPlayable(t: TrackInfo): PlayableTrack {
  return {
    id: t.trackId,
    name: t.trackName,
    artist: t.trackArtist,
    albumImage: t.trackImage,
    durationMs: t.trackDuration,
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
