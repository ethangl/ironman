"use client";

import { useState, useEffect, useCallback } from "react";
import { StreakData, SpotifyTrack } from "@/types";

export function useIronman() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const check = () => {
      fetch("/api/ironman/status")
        .then(async (r) => {
          const text = await r.text();
          if (!text || text === "null") return null;
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        })
        .then((data) => setStreak(data))
        .catch(() => setStreak(null))
        .finally(() => setLoading(false));
    };

    check();
    const interval = setInterval(check, 3_000);
    return () => clearInterval(interval);
  }, []);

  const startStreak = useCallback(async (
    track: SpotifyTrack,
    hardcore = false,
    opts?: { deviceId?: string; playbackStarted?: boolean },
  ) => {
    setStarting(true);
    try {
      const res = await fetch("/api/ironman/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          trackName: track.name,
          trackArtist: track.artist,
          trackImage: track.albumImage,
          trackDuration: track.durationMs,
          hardcore,
          deviceId: opts?.deviceId,
          playbackStarted: opts?.playbackStarted,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreak(data);
        return { success: true as const };
      } else {
        const err = await res.json();
        return { success: false as const, error: err.error, status: res.status };
      }
    } catch {
      return { success: false as const, error: "Network error", status: 0 };
    } finally {
      setStarting(false);
    }
  }, []);

  const surrender = useCallback(() => {
    setStreak(null);
  }, []);

  return { streak, loading, starting, startStreak, surrender };
}
