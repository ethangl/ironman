"use client";

import { useEffect, useRef, useCallback } from "react";
import { StreakData } from "@/types";
import { type SdkPlaybackState } from "./web-player";

const POLL_INTERVAL = 4000;

export interface WeaknessEvent {
  id: string;
  type: "paused" | "quit" | "wrong_song";
  detail: string | null;
  createdAt: string;
}

async function reportWeakness(
  type: string,
  detail?: string
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
  accessToken,
  onCountUpdate,
  onProgress,
  onWeakness,
  onBroken,
  onTokenExpired,
  sdkState,
}: {
  streak: StreakData;
  accessToken: string;
  onCountUpdate: (count: number) => void;
  onProgress?: (progressMs: number, durationMs: number) => void;
  onWeakness?: (event: WeaknessEvent) => void;
  onBroken?: () => void;
  onTokenExpired?: () => void;
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
      if (result?.broken) {
        brokenRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        onBroken?.();
      }
    },
    [onWeakness, onBroken]
  );

  // Debounced pause/quit detection — avoids false weakness on brief transitions
  const debouncedPauseWeakness = useCallback(
    (type: "paused" | "quit") => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        // Only report if still in that state
        if (prevState.current === type) {
          handleWeakness(type);
        }
        pauseTimerRef.current = null;
      }, 800);
    },
    [handleWeakness]
  );

  const cancelPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const enforce = useCallback(async () => {
    if (!accessToken || brokenRef.current) return;

    try {
      const res = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Token expired — ask parent to refresh
      if (res.status === 401) {
        onTokenExpired?.();
        return;
      }

      // No player / no content — Spotify is closed or inactive
      if (res.status === 204 || res.status === 202) {
        if (prevState.current !== "quit") {
          prevState.current = "quit";
          debouncedPauseWeakness("quit");
        }
        return;
      }
      if (!res.ok) return;

      const playback = await res.json();

      // Player exists but paused
      if (!playback?.is_playing) {
        if (prevState.current !== "paused") {
          prevState.current = "paused";
          debouncedPauseWeakness("paused");
        }
        return;
      }

      // Playing the wrong song
      if (playback.item?.id !== streak.trackId) {
        const wrongSong = playback.item
          ? `${playback.item.name} — ${playback.item.artists?.map((a: any) => a.name).join(", ")}`
          : null;

        prevState.current = "playing";
        await handleWeakness("wrong_song", wrongSong ?? undefined);

        // Force it back
        await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [`spotify:track:${streak.trackId}`],
          }),
        });

        await fetch(
          "https://api.spotify.com/v1/me/player/repeat?state=track",
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        return;
      }

      // Correct song playing — back to normal
      prevState.current = "playing";
      cancelPauseTimer();
      onProgress?.(playback.progress_ms, playback.item.duration_ms);

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
    } catch (e) {
      // Next poll will retry
    }
  }, [accessToken, streak.trackId, onCountUpdate, onProgress, handleWeakness, debouncedPauseWeakness, cancelPauseTimer]);

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
      // Force it back
      fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [`spotify:track:${streak.trackId}`],
        }),
      });
      return;
    }

    if (!sdkState.paused) {
      prevState.current = "playing";
      cancelPauseTimer();
    }
  }, [sdkState, streak.trackId, accessToken, handleWeakness, debouncedPauseWeakness, cancelPauseTimer]);

  useEffect(() => {
    enforce();
    intervalRef.current = setInterval(enforce, POLL_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") enforce();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enforce]);

  return null;
}
