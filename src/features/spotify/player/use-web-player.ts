import { createContext, useContext } from "react";

import { Track } from "@/types";
import type { PlayResult, SdkPlaybackState } from "@/types/spotify-playback";

/** Stable actions/state that rarely change — safe to consume without causing frequent re-renders. */
interface WebPlayerActionsValue {
  isAuthenticated: boolean;
  playTrack: (track: Track) => Promise<void>;
  playTracks: (tracks: Track[], startIndex?: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  togglePlay: () => Promise<void>;
  toggleShuffle: () => void;
  setVolume: (val: number) => Promise<void>;
  setExpanded: (expanded: boolean) => void;
  spotify: {
    init: () => void;
    waitForReady: () => Promise<string | null>;
    play: (
      uri: string,
      deviceId?: string,
      offsetMs?: number,
    ) => Promise<PlayResult>;
    setRepeat: (state: string, deviceId?: string) => Promise<void>;
  };
}

/** Fast-changing playback state — only consume in components that need live updates. */
interface WebPlayerStateValue {
  currentTrack: Track | null;
  sdkState: SdkPlaybackState | null;
  paused: boolean;
  progressMs: number;
  durationMs: number;
  volume: number;
  expanded: boolean;
  palette: string[];
  queue: Track[];
  queueIndex: number;
  shuffled: boolean;
  hasQueue: boolean;
}

export type WebPlayerContextValue = WebPlayerActionsValue & WebPlayerStateValue;

export const WebPlayerActionsContext =
  createContext<WebPlayerActionsValue | null>(null);
export const WebPlayerStateContext = createContext<WebPlayerStateValue | null>(
  null,
);

/** Returns only stable actions — does NOT re-render on playback progress. */
export function useWebPlayerActions() {
  const ctx = useContext(WebPlayerActionsContext);
  if (!ctx)
    throw new Error(
      "useWebPlayerActions must be used within WebPlayerProvider",
    );
  return ctx;
}

/** Returns fast-changing playback state — will re-render on progress/state changes. */
export function useWebPlayerState() {
  const ctx = useContext(WebPlayerStateContext);
  if (!ctx)
    throw new Error("useWebPlayerState must be used within WebPlayerProvider");
  return ctx;
}

/** Returns everything (actions + state). Use sparingly — prefer useWebPlayerActions or useWebPlayerState. */
export function useWebPlayer() {
  return { ...useWebPlayerActions(), ...useWebPlayerState() };
}
