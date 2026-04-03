"use client";

import { useState, useEffect, useCallback } from "react";
import { StreakData, SpotifyTrack } from "@/types";

export function useIronman() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/ironman/status")
      .then(async (r) => {
        const text = await r.text();
        if (!text || text === "null") return null;
        try {
          return JSON.parse(text);
        } catch {
          console.error("[use-ironman] bad status response:", text.substring(0, 100));
          return null;
        }
      })
      .then((data) => setStreak(data))
      .catch(() => setStreak(null))
      .finally(() => setLoading(false));
  }, []);

  const startStreak = useCallback(async (track: SpotifyTrack) => {
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreak(data);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error };
      }
    } catch {
      return { success: false, error: "Network error" };
    } finally {
      setStarting(false);
    }
  }, []);

  const surrender = useCallback(() => {
    setStreak(null);
  }, []);

  return { streak, loading, starting, startStreak, surrender };
}
