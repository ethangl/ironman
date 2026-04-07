"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  type PlayResult,
  type SdkPlaybackState,
  type SpotifyPlayback,
} from "@/hooks/use-spotify";
import { StreakData } from "@/types";

const POLL_INTERVAL = 4000;

export interface WeaknessEvent {
  id: string;
  type: "paused" | "quit" | "wrong_song";
  detail: string | null;
  createdAt: string;
}

async function reportWeakness(
  type: string,
  detail?: string,
): Promise<{ broken: boolean } | null> {
  try {
    const res = await fetch("/api/ironman/weakness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, detail }),
    });
    if (res.ok) return res.json();
  } catch {}
  return null;
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
  const countRef = useRef(streak.count);
  const prevState = useRef<"playing" | "paused" | "quit">("playing");
  const brokenRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWeakness = useCallback(
    async (type: "paused" | "quit" | "wrong_song", detail?: string) => {
      onWeakness?.({
        id: Date.now().toString(),
        type,
        detail: detail ?? null,
        createdAt: new Date().toISOString(),
      });

      const result = await reportWeakness(type, detail);
      console.log("[enforcement] weakness reported:", type, "result:", result);
      if (result?.broken) {
        console.log("[enforcement] streak broken!");
        brokenRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        onBroken?.();
      }
    },
    [onWeakness, onBroken],
  );

  const debouncedPauseWeakness = useCallback(
    (type: "paused" | "quit") => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        if (prevState.current === type) {
          handleWeakness(type);
        }
        pauseTimerRef.current = null;
      }, 800);
    },
    [handleWeakness],
  );

  const cancelPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const forceCorrectTrack = useCallback(async () => {
    await play(`spotify:track:${streak.trackId}`);
    await setRepeat("track");
  }, [play, setRepeat, streak.trackId]);

  const enforce = useCallback(async () => {
    if (brokenRef.current) return;

    const { status, playback } = await getCurrentlyPlaying();

    // Token expired — retry with fresh token next poll
    if (status === 401) return;

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

      prevState.current = "playing";
      await handleWeakness("wrong_song", wrongSong ?? undefined);
      await forceCorrectTrack();
      return;
    }

    // Correct song playing — back to normal
    prevState.current = "playing";
    cancelPauseTimer();
    onProgress?.(playback.progress_ms, playback.item.duration_ms);

    if (brokenRef.current) return;

    const pollRes = await fetch("/api/ironman/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress_ms: playback.progress_ms,
        track_id: playback.item.id,
        is_playing: playback.is_playing,
      }),
    });

    if (pollRes.ok) {
      const data = await pollRes.json();
      if (data.count !== countRef.current) {
        countRef.current = data.count;
        onCountUpdate(data.count);
      }
    }
  }, [
    getCurrentlyPlaying,
    streak.trackId,
    onCountUpdate,
    onProgress,
    handleWeakness,
    forceCorrectTrack,
    debouncedPauseWeakness,
    cancelPauseTimer,
  ]);

  // Fast weakness detection via SDK events (instant, before next poll)
  useEffect(() => {
    if (!sdkState || brokenRef.current) return;

    if (sdkState.paused && prevState.current !== "paused") {
      prevState.current = "paused";
      debouncedPauseWeakness("paused");
      return;
    }

    if (sdkState.trackId && sdkState.trackId !== streak.trackId) {
      prevState.current = "playing";
      cancelPauseTimer();
      handleWeakness("wrong_song");
      forceCorrectTrack();
      return;
    }

    if (!sdkState.paused) {
      prevState.current = "playing";
      cancelPauseTimer();
    }
  }, [
    sdkState,
    streak.trackId,
    forceCorrectTrack,
    handleWeakness,
    debouncedPauseWeakness,
    cancelPauseTimer,
  ]);

  const enforceRef = useRef(enforce);
  useEffect(() => {
    enforceRef.current = enforce;
  }, [enforce]);

  useEffect(() => {
    brokenRef.current = false;
    enforceRef.current();
    intervalRef.current = setInterval(() => enforceRef.current(), POLL_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") enforceRef.current();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      brokenRef.current = true; // prevents in-flight enforce() calls from continuing
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []); // runs once on mount

  return null;
}
