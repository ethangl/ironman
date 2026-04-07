"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  type PlayResult,
  type SdkPlaybackState,
  type SpotifyPlayback,
} from "@/hooks/use-spotify";
import { StreakData } from "@/types";

const POLL_INTERVAL = 4000;
const LEADER_KEY = "ironman:enforcement-leader";
const LEADER_TTL_MS = 10_000;
const LEADER_HEARTBEAT_MS = 3_000;
const WRONG_SONG_CORRECTION_GRACE_MS = 3_000;

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
  const leaderHeartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabIdRef = useRef<string | null>(null);
  const isLeaderRef = useRef(false);
  const enforceInFlightRef = useRef(false);
  const correctionInFlightRef = useRef(false);
  const correctionCooldownUntilRef = useRef(0);

  useEffect(() => {
    countRef.current = streak.count;
  }, [streak.count]);

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

  const getTabId = useCallback(() => {
    if (!tabIdRef.current) {
      tabIdRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    return tabIdRef.current;
  }, []);

  const readLeader = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(LEADER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as { tabId: string; ts: number };
    } catch {
      return null;
    }
  }, []);

  const writeLeader = useCallback(() => {
    const entry = JSON.stringify({
      tabId: getTabId(),
      ts: Date.now(),
    });
    window.localStorage.setItem(LEADER_KEY, entry);
    isLeaderRef.current = true;
  }, [getTabId]);

  const releaseLeader = useCallback(() => {
    const current = readLeader();
    if (current?.tabId === tabIdRef.current) {
      window.localStorage.removeItem(LEADER_KEY);
    }
    isLeaderRef.current = false;
  }, [readLeader]);

  const tryBecomeLeader = useCallback(() => {
    if (document.visibilityState !== "visible") {
      releaseLeader();
      return false;
    }

    const current = readLeader();
    const expired = !current || Date.now() - current.ts > LEADER_TTL_MS;
    const isCurrentLeader = current?.tabId === getTabId();

    if (expired || isCurrentLeader) {
      writeLeader();
      return true;
    }

    isLeaderRef.current = false;
    return false;
  }, [getTabId, readLeader, releaseLeader, writeLeader]);

  const forceCorrectTrack = useCallback(async () => {
    const playRes = await play(`spotify:track:${streak.trackId}`);
    if (!playRes.ok) return false;
    correctionCooldownUntilRef.current =
      Date.now() + WRONG_SONG_CORRECTION_GRACE_MS;
    await setRepeat("track");
    return true;
  }, [play, setRepeat, streak.trackId]);

  const handleWrongSong = useCallback(
    async (detail?: string) => {
      if (
        correctionInFlightRef.current ||
        brokenRef.current ||
        Date.now() < correctionCooldownUntilRef.current
      ) {
        return;
      }
      correctionInFlightRef.current = true;
      prevState.current = "playing";
      cancelPauseTimer();

      try {
        await handleWeakness("wrong_song", detail);
        if (!brokenRef.current) {
          await forceCorrectTrack();
        }
      } finally {
        correctionInFlightRef.current = false;
      }
    },
    [cancelPauseTimer, forceCorrectTrack, handleWeakness],
  );

  const enforce = useCallback(async () => {
    if (brokenRef.current || enforceInFlightRef.current) return;
    enforceInFlightRef.current = true;

    try {
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

        await handleWrongSong(wrongSong ?? undefined);
        return;
      }

      // Correct song playing — back to normal
      prevState.current = "playing";
      cancelPauseTimer();
      correctionCooldownUntilRef.current = 0;
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
    } finally {
      enforceInFlightRef.current = false;
    }
  }, [
    cancelPauseTimer,
    debouncedPauseWeakness,
    getCurrentlyPlaying,
    handleWrongSong,
    onCountUpdate,
    onProgress,
    streak.trackId,
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
      void handleWrongSong();
      return;
    }

    if (!sdkState.paused) {
      prevState.current = "playing";
      cancelPauseTimer();
    }
  }, [
    sdkState,
    streak.trackId,
    handleWrongSong,
    debouncedPauseWeakness,
    cancelPauseTimer,
  ]);

  const enforceRef = useRef(enforce);
  useEffect(() => {
    enforceRef.current = enforce;
  }, [enforce]);

  useEffect(() => {
    brokenRef.current = false;
    if (tryBecomeLeader()) {
      enforceRef.current();
    }
    intervalRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (isLeaderRef.current || tryBecomeLeader()) {
        enforceRef.current();
      }
    }, POLL_INTERVAL);
    leaderHeartbeatRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") {
        releaseLeader();
        return;
      }

      if (isLeaderRef.current) {
        writeLeader();
      } else {
        tryBecomeLeader();
      }
    }, LEADER_HEARTBEAT_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (tryBecomeLeader()) {
          enforceRef.current();
        }
      } else {
        releaseLeader();
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LEADER_KEY) return;
      const current = readLeader();
      isLeaderRef.current = current?.tabId === tabIdRef.current;
      if (!current && document.visibilityState === "visible") {
        tryBecomeLeader();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pagehide", releaseLeader);

    return () => {
      brokenRef.current = true; // prevents in-flight enforce() calls from continuing
      enforceInFlightRef.current = false;
      correctionInFlightRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (leaderHeartbeatRef.current) clearInterval(leaderHeartbeatRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pagehide", releaseLeader);
      releaseLeader();
    };
  }, [readLeader, releaseLeader, tryBecomeLeader, writeLeader]);

  return null;
}
