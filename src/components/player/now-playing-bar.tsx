"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { type StreakData } from "@/types";
import { PauseIcon, PlayIcon, SkullIcon, VolumeIcon } from "lucide-react";
import { Slider } from "../ui/slider";
import { EnforcementEngine, type WeaknessEvent } from "./enforcement-engine";
import { useWebPlayerContext } from "./web-player-context";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function NowPlayingBar() {
  const {
    accessToken,
    sdkState,
    playerRef,
    refreshToken,
    initWebPlayer,
    waitForReady,
  } = useWebPlayerContext();
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
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
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
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const sdkActive = !!(
    sdkState &&
    streak &&
    sdkState.trackId === streak.trackId
  );

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
              body: JSON.stringify({
                uris: [`spotify:track:${streak.trackId}`],
              }),
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
  const pct =
    displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;

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

      <div className="sticky bottom-0 z-50 border-t border-white/10 bg-mist-950/95 backdrop-blur-sm">
        {/* Progress bar */}
        <div className="bg-white/5 h-1">
          <div
            className="h-full bg-red-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex h-16 items-center gap-4 px-4">
          {/* Track info */}
          <Link href="/" className="flex items-center gap-4 flex-1 min-w-0">
            {streak.trackImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={streak.trackImage}
                alt=""
                className="rounded-lg size-10 object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{streak.trackName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {streak.trackArtist}
              </p>
            </div>
          </Link>

          {/* Time */}
          <span className="text-xs tabular-nums text-muted-foreground shrink-0">
            {formatTime(displayProgress)} / {formatTime(displayDuration)}
          </span>

          <div className="flex items-center gap-4 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={togglePlay}
              className="flex items-center justify-center p-0"
            >
              {paused ? (
                <PlayIcon fill="currentColor" />
              ) : (
                <PauseIcon fill="currentColor" />
              )}
            </Button>

            <div className="flex gap-1 items-center w-32">
              <VolumeIcon className="size-4" />
              <Slider
                min={0}
                max={100}
                value={volume}
                onValueChange={(e) => handleVolume(Number(e))}
                className="flex-auto"
              />
            </div>

            {/* Count */}
            <div className="flex-none font-bold text-center text-lg">
              <span className="tabular-nums">{count}</span>
              <span className="ml-0.5 text-foreground/25">x</span>
            </div>

            <Button
              variant="destructive"
              size="icon-sm"
              onClick={handleSurrender}
              className="flex items-center justify-center p-0"
              title="Surrender"
            >
              <SkullIcon />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
