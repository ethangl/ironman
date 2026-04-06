"use client";

import { createContext, useContext } from "react";

import { type PlayResult, type SdkPlaybackState } from "@/hooks/use-spotify";
import { SpotifyTrack, StreakData } from "@/types";

interface WebPlayerContextValue {
  // Auth
  isAuthenticated: boolean;

  // Playback
  playTrack: (track: SpotifyTrack) => Promise<void>;
  togglePlay: () => Promise<void>;
  setVolume: (val: number) => Promise<void>;
  currentTrack: SpotifyTrack | null;
  sdkState: SdkPlaybackState | null;
  paused: boolean;
  progressMs: number;
  durationMs: number;
  volume: number;

  // Streak
  streak: StreakData | null;
  count: number;
  lockIn: (hardcore?: boolean) => Promise<void>;
  surrender: () => Promise<void>;

  // Spotify (for advanced consumers like lock-in-button)
  spotify: {
    init: () => void;
    waitForReady: () => Promise<string | null>;
    play: (uri: string, deviceId?: string) => Promise<PlayResult>;
    setRepeat: (state: string, deviceId?: string) => Promise<void>;
  };
}

export const WebPlayerContext = createContext<WebPlayerContextValue | null>(
  null,
);

export function useWebPlayer() {
  const ctx = useContext(WebPlayerContext);
  if (!ctx)
    throw new Error("useWebPlayer must be used within WebPlayerProvider");
  return ctx;
}
