"use client";

import { useEffect, useRef, useCallback } from "react";
import { StreakData } from "@/types";

const POLL_INTERVAL = 4000;

export interface WeaknessEvent {
  id: string;
  type: "paused" | "quit" | "wrong_song";
  detail: string | null;
  createdAt: string;
}

function reportWeakness(type: string, detail?: string) {
  fetch("/api/ironman/weakness", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, detail }),
  }).catch(() => {});
}

export function EnforcementEngine({
  streak,
  accessToken,
  onCountUpdate,
  onWeakness,
}: {
  streak: StreakData;
  accessToken: string;
  onCountUpdate: (count: number) => void;
  onWeakness?: (event: WeaknessEvent) => void;
}) {
  const countRef = useRef(streak.count);
  // Track previous state to avoid duplicate reports
  const prevState = useRef<"playing" | "paused" | "quit">("playing");

  const enforce = useCallback(async () => {
    if (!accessToken) return;

    try {
      const res = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // No player / no content — Spotify is closed or inactive
      if (res.status === 204 || res.status === 202) {
        if (prevState.current !== "quit") {
          prevState.current = "quit";
          reportWeakness("quit");
          onWeakness?.({
            id: Date.now().toString(),
            type: "quit",
            detail: null,
            createdAt: new Date().toISOString(),
          });
        }
        return;
      }
      if (!res.ok) return;

      const playback = await res.json();

      // Player exists but paused
      if (!playback?.is_playing) {
        if (prevState.current !== "paused") {
          prevState.current = "paused";
          reportWeakness("paused");
          onWeakness?.({
            id: Date.now().toString(),
            type: "paused",
            detail: null,
            createdAt: new Date().toISOString(),
          });
        }
        return;
      }

      // Playing the wrong song
      if (playback.item?.id !== streak.trackId) {
        const wrongSong = playback.item
          ? `${playback.item.name} — ${playback.item.artists?.map((a: any) => a.name).join(", ")}`
          : null;

        prevState.current = "playing";
        reportWeakness("wrong_song", wrongSong ?? undefined);
        onWeakness?.({
          id: Date.now().toString(),
          type: "wrong_song",
          detail: wrongSong,
          createdAt: new Date().toISOString(),
        });

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
  }, [accessToken, streak.trackId, onCountUpdate, onWeakness]);

  useEffect(() => {
    enforce();
    const interval = setInterval(enforce, POLL_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") enforce();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enforce]);

  return null;
}
