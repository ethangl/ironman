export interface SdkPlaybackState {
  position: number;
  duration: number;
  paused: boolean;
  trackId: string | null;
}

export interface SpotifyPlayback {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists?: { name: string }[];
  } | null;
}

export interface PlayResult {
  ok: boolean;
  status: number;
}
