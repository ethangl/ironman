"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useWebPlayerContext } from "./web-player-context";
import { type StreakData } from "@/types";
import { EnforcementEngine, type WeaknessEvent } from "./enforcement-engine";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function NowPlayingBar() {
  const { accessToken, sdkState, playerRef, refreshToken, initWebPlayer, waitForReady } = useWebPlayerContext();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [count, setCount] = useState(0);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(50);
  const [showVolume, setShowVolume] = useState(false);
  const countRef = useRef(0);

  // Poll for active streak
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      fetch("/api/ironman/status")
        .then(async (r) => {
          const text = await r.text();
          if (!text || text === "null") return null;
          try { return JSON.parse(text); } catch { return null; }
        })
        .then((data) => {
          if (!cancelled) {
            setStreak(data);
            if (data) {
              setCount(data.count);
              countRef.current = data.count;
              setDurationMs(data.trackDuration);
            }
          }
        })
        .catch(() => {});
    };

    check();
    const interval = setInterval(check, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const sdkActive = !!(sdkState && streak && sdkState.trackId === streak.trackId);

  const handleCountUpdate = useCallback((newCount: number) => {
    countRef.current = newCount;
    setCount(newCount);
  }, []);

  const handleProgress = useCallback((p: number, d: number) => {
    setProgressMs(p);
    setDurationMs(d);
  }, []);

  const handleWeakness = useCallback((_event: WeaknessEvent) => {}, []);

  const handleBroken = useCallback(() => {
    setStreak(null);
  }, []);

  const handleSurrender = async () => {
    const res = await fetch("/api/ironman/surrender", { method: "POST" });
    if (res.ok) {
      playerRef.current?.pause();
      setStreak(null);
    }
  };

  const togglePlay = async () => {
    if (sdkActive && playerRef.current) {
      await playerRef.current.togglePlay();
      return;
    }
    if (!accessToken || !streak) return;

    const endpoint = paused
      ? "https://api.spotify.com/v1/me/player/play"
      : "https://api.spotify.com/v1/me/player/pause";
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok || res.status === 204) {
        setPaused(!paused);
        return;
      }

      // No device — init SDK and play (click = user gesture context)
      if (res.status === 404 && paused) {
        initWebPlayer();
        const deviceId = await waitForReady();
        if (deviceId) {
          await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ uris: [`spotify:track:${streak.trackId}`] }),
            },
          );
          await fetch(
            `https://api.spotify.com/v1/me/player/repeat?state=track&device_id=${deviceId}`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          setPaused(false);
        }
      }
    } catch {}
  };

  const handleVolume = async (val: number) => {
    setVolume(val);
    if (sdkActive && playerRef.current) {
      await playerRef.current.setVolume(val / 100);
      return;
    }
    if (!accessToken) return;
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${val}`,
        { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch {}
  };

  // Derive paused from SDK state
  useEffect(() => {
    if (sdkActive) setPaused(sdkState!.paused);
  }, [sdkActive, sdkState]);

  const displayProgress = sdkActive ? sdkState!.position : progressMs;
  const displayDuration = sdkActive ? sdkState!.duration : durationMs;
  const pct = displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;

  if (!streak?.active || !accessToken) return null;

  return (
    <>
      {/* Invisible enforcement engine */}
      <EnforcementEngine
        streak={streak}
        accessToken={accessToken}
        onCountUpdate={handleCountUpdate}
        onProgress={handleProgress}
        onWeakness={handleWeakness}
        onBroken={handleBroken}
        onTokenExpired={refreshToken}
        sdkState={sdkState}
      />

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-zinc-950/95 backdrop-blur-sm">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-red-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-2.5">
          {/* Track info */}
          <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
            {streak.trackImage && (
              <img
                src={streak.trackImage}
                alt=""
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{streak.trackName}</p>
              <p className="truncate text-xs text-zinc-400">{streak.trackArtist}</p>
            </div>
          </Link>

          {/* Count */}
          <div className="text-center shrink-0">
            <span className="text-lg font-bold tabular-nums">{count}</span>
            <span className="ml-1 text-xs text-zinc-500">plays</span>
          </div>

          {/* Time */}
          <span className="text-xs tabular-nums text-zinc-500 shrink-0">
            {formatTime(displayProgress)} / {formatTime(displayDuration)}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSurrender}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-red-500/20 transition"
              title="Surrender"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              {paused ? (
                <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowVolume(!showVolume)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  {volume === 0 ? (
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  ) : (
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  )}
                </svg>
              </button>
              {showVolume && (
                <div className="absolute bottom-full mb-2 right-0 rounded-xl bg-zinc-900 border border-white/10 p-3 shadow-xl">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => handleVolume(Number(e.target.value))}
                    className="h-1 w-24 accent-red-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
