import { useCallback, useEffect, useRef } from "react";

import { useIronmanClient } from "@/app";
import {
  type PlayResult,
  type SdkPlaybackState,
  type SpotifyPlayback,
} from "@/types/spotify-playback";
import { StreakData } from "@/types";
import { logEnforcement, logEnforcementError } from "./enforcement-runtime";
import { useEnforcementLeader } from "./use-enforcement-leader";
import { useWrongSongEnforcement } from "./use-wrong-song-enforcement";

export interface WeaknessEvent {
  id: string;
  type: "paused" | "quit" | "wrong_song";
  detail: string | null;
  createdAt: string;
}

export function EnforcementEngine({
  streak,
  getCurrentlyPlaying,
  play,
  setRepeat,
  onCountUpdate,
  onProgress,
  onWeakness,
  onBroken,
  sdkState,
}: {
  streak: StreakData;
  getCurrentlyPlaying: () => Promise<{
    status: number;
    playback: SpotifyPlayback | null;
  }>;
  play: (uri: string, deviceId?: string) => Promise<PlayResult>;
  setRepeat: (state: string, deviceId?: string) => Promise<void>;
  onCountUpdate: (count: number) => void;
  onProgress?: (progressMs: number, durationMs: number) => void;
  onWeakness?: (event: WeaknessEvent) => void;
  onBroken?: () => void;
  sdkState?: SdkPlaybackState | null;
}) {
  const ironmanClient = useIronmanClient();
  const countRef = useRef(streak.count);
  const prevState = useRef<"playing" | "paused" | "quit">("playing");
  const brokenRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enforceInFlightRef = useRef(false);
  const enforceRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    countRef.current = streak.count;
  }, [streak.count]);

  const { canEnforceNow, stopMonitoring } = useEnforcementLeader({
    enforceRef,
  });

  const handleWeakness = useCallback(
    async (type: "paused" | "quit" | "wrong_song", detail?: string) => {
      onWeakness?.({
        id: Date.now().toString(),
        type,
        detail: detail ?? null,
        createdAt: new Date().toISOString(),
      });

      const result = await ironmanClient
        .reportWeakness(type, detail)
        .catch(() => null);
      console.log("[enforcement] weakness reported:", type, "result:", result);
      if (result?.broken) {
        console.log("[enforcement] streak broken!");
        brokenRef.current = true;
        stopMonitoring();
        onBroken?.();
      }
    },
    [ironmanClient, onWeakness, onBroken, stopMonitoring],
  );

  const cancelPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const debouncedPauseWeakness = useCallback(
    (type: "paused" | "quit") => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        if (prevState.current === type && canEnforceNow()) {
          void handleWeakness(type).catch((error) => {
            logEnforcementError(`${type} weakness handling failed`, error);
          });
        }
        pauseTimerRef.current = null;
      }, 800);
    },
    [canEnforceNow, handleWeakness],
  );

  const setPlayingState = useCallback(() => {
    prevState.current = "playing";
  }, []);

  const { clearWrongSongRuntime, handleWrongSong, resetWrongSongState } =
    useWrongSongEnforcement({
      brokenRef,
      canEnforceNow,
      cancelPauseTimer,
      handleWeakness,
      play,
      setPlayingState,
      setRepeat,
      trackId: streak.trackId,
    });

  const enforce = useCallback(async () => {
    if (brokenRef.current) {
      logEnforcement("poll skipped: streak already broken");
      return;
    }
    if (enforceInFlightRef.current) {
      logEnforcement("poll skipped: previous run still in flight");
      return;
    }
    enforceInFlightRef.current = true;

    try {
      const { status, playback } = await getCurrentlyPlaying();
      logEnforcement("poll result", {
        status,
        hasPlayback: !!playback,
        trackId: playback?.item?.id ?? null,
        isPlaying: playback?.is_playing ?? null,
      });

      // Token expired — retry with fresh token next poll
      if (status === 401) {
        logEnforcement("poll deferred: spotify auth expired");
        return;
      }

      // No player / no content — Spotify is closed or inactive
      if (status === 204 || status === 202) {
        if (prevState.current !== "quit") {
          prevState.current = "quit";
          debouncedPauseWeakness("quit");
        }
        return;
      }
      if (!playback) return;

      // Player exists but paused
      if (!playback.is_playing) {
        if (prevState.current !== "paused") {
          prevState.current = "paused";
          debouncedPauseWeakness("paused");
        }
        return;
      }

      // Playing the wrong song
      if (playback.item?.id !== streak.trackId) {
        const wrongSong = playback.item
          ? `${playback.item.name} — ${playback.item.artists?.map((a: { name: string }) => a.name).join(", ")}`
          : null;

        await handleWrongSong({
          detail: wrongSong ?? undefined,
          signature: playback.item?.id ?? null,
        });
        return;
      }

      // Correct song playing — back to normal
      setPlayingState();
      cancelPauseTimer();
      resetWrongSongState();
      onProgress?.(playback.progress_ms, playback.item.duration_ms);

      if (brokenRef.current) return;

      const data = await ironmanClient.poll({
        progressMs: playback.progress_ms,
        trackId: playback.item.id,
        isPlaying: playback.is_playing,
      }).catch(() => null);

      if (data && data.count !== countRef.current) {
        countRef.current = data.count;
        onCountUpdate(data.count);
        logEnforcement("count updated", { count: data.count });
      }
    } catch (error) {
      logEnforcementError("enforcement poll failed", error);
    } finally {
      enforceInFlightRef.current = false;
    }
  }, [
    cancelPauseTimer,
    debouncedPauseWeakness,
    getCurrentlyPlaying,
    handleWrongSong,
    ironmanClient,
    onCountUpdate,
    onProgress,
    streak.trackId,
  ]);

  enforceRef.current = enforce;

  useEffect(() => {
    if (!sdkState || brokenRef.current) return;
    if (!canEnforceNow()) return;

    if (sdkState.paused && prevState.current !== "paused") {
      prevState.current = "paused";
      debouncedPauseWeakness("paused");
      return;
    }

    if (sdkState.trackId && sdkState.trackId !== streak.trackId) {
      void handleWrongSong({
        signature: sdkState.trackId,
      });
      return;
    }

    if (!sdkState.paused) {
      setPlayingState();
      cancelPauseTimer();
      resetWrongSongState();
    }
  }, [
    canEnforceNow,
    sdkState,
    streak.trackId,
    handleWrongSong,
    debouncedPauseWeakness,
    cancelPauseTimer,
    setPlayingState,
    resetWrongSongState,
  ]);

  useEffect(() => {
    brokenRef.current = false;

    return () => {
      brokenRef.current = true;
      enforceInFlightRef.current = false;
      clearWrongSongRuntime();
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      stopMonitoring();
    };
  }, [clearWrongSongRuntime, stopMonitoring]);

  return null;
}
