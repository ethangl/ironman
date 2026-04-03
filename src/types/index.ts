export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumImage: string | null;
  durationMs: number;
  topStreak?: { count: number; userName: string | null } | null;
  difficulty?: number;
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

export interface StreakData {
  id: string;
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration: number;
  count: number;
  active: boolean;
  hardcore?: boolean;
  startedAt: string;
  userName?: string;
  userImage?: string;
}
