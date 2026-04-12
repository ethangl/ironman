import { useCallback, type Dispatch, type SetStateAction } from "react";

import type { Track, StreakData } from "@/types";
import { toTrack, toTrackInfo } from "@/types";

import type { IronmanClient } from "./ironman-client";

export function useIronmanPlayerActions({
  applyStreakState,
  broadcastStreakState,
  canUseIronman,
  clearPlaybackAfterBrokenStreak,
  currentTrack,
  getAccessToken,
  ironmanClient,
  restoreTrackAfterSurrender,
  setCurrentTrack,
  setRepeat,
  streak,
}: {
  applyStreakState: (nextStreak: StreakData | null) => void;
  broadcastStreakState: (nextStreak: StreakData | null) => void;
  canUseIronman: boolean;
  clearPlaybackAfterBrokenStreak: () => void;
  currentTrack: Track | null;
  getAccessToken: () => Promise<string | null>;
  ironmanClient: IronmanClient;
  restoreTrackAfterSurrender: (track: Track) => void;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  setRepeat: (state: string, deviceId?: string) => Promise<void>;
  streak: StreakData | null;
}) {
  const handleBroken = useCallback(() => {
    console.log("[web-player] streak broken — ending");
    clearPlaybackAfterBrokenStreak();
    applyStreakState(null);
    broadcastStreakState(null);
  }, [applyStreakState, broadcastStreakState, clearPlaybackAfterBrokenStreak]);

  const lockIn = useCallback(async () => {
    if (!canUseIronman) return;

    const token = await getAccessToken();
    if (!token || !currentTrack) return;

    try {
      const data = await ironmanClient.start({
        ...toTrackInfo(currentTrack),
        playbackStarted: true,
      });
      applyStreakState(data);
      broadcastStreakState(data);
      setCurrentTrack(null);
      await setRepeat("track");
    } catch {
      // Leave playback untouched when lock-in fails.
    }
  }, [
    applyStreakState,
    broadcastStreakState,
    canUseIronman,
    currentTrack,
    getAccessToken,
    ironmanClient,
    setCurrentTrack,
    setRepeat,
  ]);

  const activateHardcore = useCallback(async () => {
    if (!canUseIronman || !streak?.active || streak.hardcore) return;

    try {
      await ironmanClient.activateHardcore();
      const nextStreak = { ...streak, hardcore: true };
      applyStreakState(nextStreak);
      broadcastStreakState(nextStreak);
    } catch {
      // Keep the current streak state when hardcore activation fails.
    }
  }, [
    applyStreakState,
    broadcastStreakState,
    canUseIronman,
    ironmanClient,
    streak,
  ]);

  const surrender = useCallback(async () => {
    if (!canUseIronman) return;

    try {
      await ironmanClient.surrender();
      if (streak) {
        restoreTrackAfterSurrender(toTrack(streak));
      }
      applyStreakState(null);
      broadcastStreakState(null);
      if (streak) {
        void setRepeat("off").catch(() => {
          // Keep the local surrender state even if Spotify repeat cleanup fails.
        });
      }
    } catch {
      // Ignore surrender failures and preserve the active streak locally.
    }
  }, [
    applyStreakState,
    broadcastStreakState,
    canUseIronman,
    ironmanClient,
    restoreTrackAfterSurrender,
    setRepeat,
    streak,
  ]);

  return {
    activateHardcore,
    handleBroken,
    lockIn,
    surrender,
  };
}
