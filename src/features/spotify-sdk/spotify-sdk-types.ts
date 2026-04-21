export interface SpotifyPlayerConstructorOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

export interface SpotifyPlaybackState {
  position: number;
  duration: number;
  paused: boolean;
  track_window?: { current_track?: { id: string } };
}

export interface SpotifySDK {
  Player: new (options: SpotifyPlayerConstructorOptions) => SpotifyPlayer;
}

declare global {
  interface Window {
    Spotify: SpotifySDK;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  activateElement(): void;
  togglePlay(): Promise<void>;
  pause(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
  addListener(event: string, callback: (data: never) => void): void;
}

export interface ReadyWaiter {
  resolve: (deviceId: string | null) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}
