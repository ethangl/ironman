import { useCallback, useEffect, useRef } from "react";

import { useIronmanClient } from "@/app";
import {
  type PlayResult,
  type SdkPlaybackState,
  type SpotifyPlayback,
} from "@/types/spotify-playback";
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

function logEnforcement(message: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "test") return;

  if (details && Object.keys(details).length > 0) {
    console.info("[enforcement]", message, details);
    return;
  }

  console.info("[enforcement]", message);
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaderHeartbeatRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
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

      const result = await ironmanClient
        .reportWeakness(type, detail)
        .catch(() => null);
      console.log("[enforcement] weakness reported:", type, "result:", result);
      if (result?.broken) {
        console.log("[enforcement] streak broken!");
        brokenRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        onBroken?.();
      }
    },
    [ironmanClient, onWeakness, onBroken],
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
    logEnforcement("leader heartbeat/write", { tabId: getTabId() });
  }, [getTabId]);

  const releaseLeader = useCallback(() => {
    const current = readLeader();
    if (current?.tabId === tabIdRef.current) {
      window.localStorage.removeItem(LEADER_KEY);
      logEnforcement("leader released", { tabId: tabIdRef.current });
    }
    isLeaderRef.current = false;
  }, [readLeader]);

  const tryBecomeLeader = useCallback(() => {
    if (document.visibilityState !== "visible") {
      logEnforcement("leader skipped: hidden tab");
      releaseLeader();
      return false;
    }

    const current = readLeader();
    const expired = !current || Date.now() - current.ts > LEADER_TTL_MS;
    const isCurrentLeader = current?.tabId === getTabId();

    if (expired || isCurrentLeader) {
      writeLeader();
      logEnforcement("leader active", {
        tabId: getTabId(),
        reason: expired ? "expired-or-empty" : "already-leader",
      });
      return true;
    }

    isLeaderRef.current = false;
    logEnforcement("leader follower", {
      tabId: getTabId(),
      leaderTabId: current?.tabId,
    });
    return false;
  }, [getTabId, readLeader, releaseLeader, writeLeader]);

  const forceCorrectTrack = useCallback(async () => {
    logEnforcement("correction play requested", { trackId: streak.trackId });
    const playRes = await play(`spotify:track:${streak.trackId}`);
    if (!playRes.ok) {
      logEnforcement("correction play failed", {
        trackId: streak.trackId,
        status: playRes.status,
      });
      return false;
    }
    correctionCooldownUntilRef.current =
      Date.now() + WRONG_SONG_CORRECTION_GRACE_MS;
    await setRepeat("track");
    logEnforcement("correction applied", {
      trackId: streak.trackId,
      cooldownMs: WRONG_SONG_CORRECTION_GRACE_MS,
    });
    return true;
  }, [play, setRepeat, streak.trackId]);

  const handleWrongSong = useCallback(
    async (detail?: string) => {
      if (correctionInFlightRef.current) {
        logEnforcement("wrong song ignored: correction in flight", { detail });
        return;
      }
      if (brokenRef.current) {
        logEnforcement("wrong song ignored: streak already broken", { detail });
        return;
      }
      if (Date.now() < correctionCooldownUntilRef.current) {
        logEnforcement("wrong song ignored: in correction grace window", {
          detail,
          remainingMs: correctionCooldownUntilRef.current - Date.now(),
        });
        return;
      }
      logEnforcement("wrong song detected", {
        detail,
        expectedTrackId: streak.trackId,
      });
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
    [cancelPauseTimer, forceCorrectTrack, handleWeakness, streak.trackId],
  );

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

        await handleWrongSong(wrongSong ?? undefined);
        return;
      }

      // Correct song playing — back to normal
      prevState.current = "playing";
      cancelPauseTimer();
      correctionCooldownUntilRef.current = 0;
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
      logEnforcement("initial enforcement run");
      enforceRef.current();
    }
    intervalRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") {
        logEnforcement("interval skipped: hidden tab");
        return;
      }
      if (isLeaderRef.current || tryBecomeLeader()) {
        enforceRef.current();
      } else {
        logEnforcement("interval skipped: follower tab");
      }
    }, POLL_INTERVAL);
    leaderHeartbeatRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") {
        logEnforcement("heartbeat skipped: hidden tab");
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
        logEnforcement("visibility: visible");
        if (tryBecomeLeader()) {
          enforceRef.current();
        }
      } else {
        logEnforcement("visibility: hidden");
        releaseLeader();
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LEADER_KEY) return;
      const current = readLeader();
      isLeaderRef.current = current?.tabId === tabIdRef.current;
      logEnforcement("storage leader update", {
        leaderTabId: current?.tabId ?? null,
        tabId: tabIdRef.current,
        isLeader: isLeaderRef.current,
      });
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
