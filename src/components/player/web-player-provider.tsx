"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EnforcementEngine } from "@/components/player/enforcement-engine";
import { SdkPlaybackState, useSpotify } from "@/hooks/use-spotify";
import {
  WebPlayerActionsContext,
  WebPlayerStateContext,
} from "@/hooks/use-web-player";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { PlayableTrack, SpotifyTrack, StreakData } from "@/types";
import { toast } from "sonner";
import { MiniPlayer } from "./mini-player";
import { StandardPlayer } from "./standard-player";

const STREAK_CHANNEL_NAME = "ironman-streak";

type StreakSyncMessage = {
  type: "streak_state";
  source: string;
  streak: StreakData | null;
};

function getPlaybackFailureMessage(status: number) {
  switch (status) {
    case 401:
      return "Your Spotify session expired. Reconnect Spotify and try again.";
    case 403:
      return "Spotify blocked this action. Premium or additional permissions may be required.";
    case 429:
      return "Spotify is rate limiting playback right now. Please wait a bit and try again.";
    case 404:
      return "No active Spotify device was available.";
    default:
      return "Spotify could not complete that action right now.";
  }
}

function generateShuffleOrder(length: number, pinIndex: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Pin the current track at position 0
  const pos = order.indexOf(pinIndex);
  if (pos !== 0) [order[0], order[pos]] = [order[pos], order[0]];
  return order;
}

export function WebPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const tokenRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const autoPlayAttempted = useRef(false);

  // Track & streak state
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const streakRef = useRef<StreakData | null>(null);
  const streakChannelRef = useRef<BroadcastChannel | null>(null);
  const syncSourceRef = useRef<string | null>(null);
  const playbackAttemptRef = useRef(0);
  const startPlaybackInFlightRef = useRef(false);
  const activePlaybackTrackRef = useRef<PlayableTrack | null>(null);
  const queuedPlaybackTrackRef = useRef<PlayableTrack | null>(null);

  // Playback state
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [apiPaused, setApiPaused] = useState(true);
  const [volume, setVolumeState] = useState(50);
  const [expanded, setExpanded] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);

  // Queue state
  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const hasQueue = queue.length > 1;

  const trackId = streak?.trackId ?? currentTrack?.id ?? null;
  const artworkUrl = streak?.trackImage ?? currentTrack?.albumImage ?? null;

  const getAccessToken = useCallback(async () => {
    const res = await authClient.getAccessToken({ providerId: "spotify" });
    tokenRef.current = res.data?.accessToken ?? null;
    return tokenRef.current;
  }, []);

  const spotify = useSpotify({ getAccessToken, tokenRef, trackId });
  const {
    sdkState,
    init: initSpotify,
    waitForReady,
    play,
    resume,
    pause,
    setVolume: setSpotifyVolume,
    setRepeat,
    getCurrentlyPlaying,
  } = spotify;

  const isAuthenticated = !!session;
  const paused = sdkState ? sdkState.paused : apiPaused;

  const getSyncSource = useCallback(() => {
    if (!syncSourceRef.current) {
      syncSourceRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `streak-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    return syncSourceRef.current;
  }, []);

  const applyStreakState = useCallback((nextStreak: StreakData | null) => {
    streakRef.current = nextStreak;
    setStreak(nextStreak);
    if (nextStreak) {
      countRef.current = nextStreak.count;
      setCount(nextStreak.count);
      setDurationMs(nextStreak.trackDuration);
      return;
    }

    countRef.current = 0;
    setCount(0);
    setDurationMs(0);
  }, []);

  const broadcastStreakState = useCallback(
    (nextStreak: StreakData | null) => {
      streakChannelRef.current?.postMessage({
        type: "streak_state",
        source: getSyncSource(),
        streak: nextStreak,
      } satisfies StreakSyncMessage);
    },
    [getSyncSource],
  );

  // --- Palette extraction ---

  useEffect(() => {
    if (!artworkUrl) return;
    let cancelled = false;
    fetch(`/api/palette?url=${encodeURIComponent(artworkUrl)}`)
      .then((r) => r.json())
      .then((colors: string[]) => {
        if (cancelled) return;
        setPalette(colors);
        const root = document.documentElement;
        colors.forEach((c, i) => root.style.setProperty(`--palette-${i}`, c));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      const root = document.documentElement;
      for (let i = 0; i < 5; i++) root.style.removeProperty(`--palette-${i}`);
    };
  }, [artworkUrl]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  // --- Streak sync ---

  const fetchStreakStatus =
    useCallback(async (): Promise<StreakData | null> => {
      const res = await fetch("/api/ironman/status");
      if (!res.ok) return null;
      return res.json();
    }, []);

  useEffect(() => {
    if (!session) {
      queueMicrotask(() => applyStreakState(null));
      return;
    }

    let cancelled = false;
    const syncFromServer = async () => {
      try {
        const data = await fetchStreakStatus();
        if (!cancelled) applyStreakState(data);
      } catch {}
    };

    void syncFromServer();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void syncFromServer();
      }
    };

    window.addEventListener("focus", syncFromServer);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncFromServer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [session, applyStreakState, fetchStreakStatus]);

  useEffect(() => {
    if (!session || typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(STREAK_CHANNEL_NAME);
    streakChannelRef.current = channel;

    const handleMessage = (event: MessageEvent<StreakSyncMessage>) => {
      const message = event.data;
      if (
        !message ||
        message.type !== "streak_state" ||
        message.source === getSyncSource()
      ) {
        return;
      }

      applyStreakState(message.streak);
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      if (streakChannelRef.current === channel) {
        streakChannelRef.current = null;
      }
    };
  }, [session, applyStreakState, getSyncSource]);

  // --- Enforcement callbacks ---

  const handleCountUpdate = useCallback(
    (newCount: number) => {
      countRef.current = newCount;
      setCount(newCount);
      if (streakRef.current) {
        const nextStreak = { ...streakRef.current, count: newCount };
        streakRef.current = nextStreak;
        setStreak(nextStreak);
        broadcastStreakState(nextStreak);
      }
    },
    [broadcastStreakState],
  );

  const handleProgress = useCallback((p: number, d: number) => {
    setProgressMs(p);
    setDurationMs(d);
  }, []);

  const handleBroken = useCallback(() => {
    console.log("[web-player] streak broken — ending");
    playbackAttemptRef.current += 1;
    activePlaybackTrackRef.current = null;
    queuedPlaybackTrackRef.current = null;
    void pause();
    applyStreakState(null);
    broadcastStreakState(null);
    setCurrentTrack(null);
    setQueue([]);
    setQueueIndex(0);
  }, [applyStreakState, broadcastStreakState, pause]);

  // --- Playback controls ---

  const runPlaybackAttempt = useCallback(
    async (track: PlayableTrack) => {
      activePlaybackTrackRef.current = track;
      const attemptId = ++playbackAttemptRef.current;
      const isLatestAttempt = () => playbackAttemptRef.current === attemptId;

      const token = await getAccessToken();
      if (!token) return;

      initSpotify();
      setCurrentTrack(track);

      const uri = `spotify:track:${track.id}`;
      const res = await play(uri);

      if (res.ok) {
        if (isLatestAttempt()) setApiPaused(false);
        return;
      }

      // No active device — fall back to SDK
      if (res.status === 404) {
        const sdkDeviceId = await waitForReady();
        if (!isLatestAttempt()) return;
        if (!sdkDeviceId) {
          toast.error(
            "Could not start playback. Please open Spotify on a device and try again.",
          );
          if (isLatestAttempt()) setCurrentTrack(null);
          return;
        }

        for (let attempt = 0; attempt < 2; attempt++) {
          if (!isLatestAttempt()) return;
          if (attempt > 0) await new Promise((r) => setTimeout(r, 750));
          try {
            const playRes = await play(uri, sdkDeviceId);
            if (playRes.ok) {
              if (isLatestAttempt()) setApiPaused(false);
              return;
            }
          } catch {}
        }

        toast.error(
          "Could not start playback. Please open Spotify on a device and try again.",
        );
        if (isLatestAttempt()) setCurrentTrack(null);
        return;
      }

      if (isLatestAttempt()) {
        toast.error(getPlaybackFailureMessage(res.status));
      }
    },
    [getAccessToken, initSpotify, play, waitForReady],
  );

  const startPlayback = useCallback(
    async (track: PlayableTrack) => {
      if (startPlaybackInFlightRef.current) {
        const sameAsActive = activePlaybackTrackRef.current?.id === track.id;
        const sameAsQueued = queuedPlaybackTrackRef.current?.id === track.id;
        if (!sameAsActive && !sameAsQueued) {
          queuedPlaybackTrackRef.current = track;
        }
        return;
      }

      startPlaybackInFlightRef.current = true;
      let nextTrack: PlayableTrack | null = track;

      try {
        while (nextTrack) {
          queuedPlaybackTrackRef.current = null;
          await runPlaybackAttempt(nextTrack);
          nextTrack = queuedPlaybackTrackRef.current;
        }
      } finally {
        startPlaybackInFlightRef.current = false;
        activePlaybackTrackRef.current = null;
        queuedPlaybackTrackRef.current = null;
      }
    },
    [runPlaybackAttempt],
  );

  const playTrack = useCallback(
    async (track: PlayableTrack) => {
      setQueue([track]);
      setQueueIndex(0);
      setShuffled(false);
      setShuffleOrder([]);
      await startPlayback(track);
    },
    [startPlayback],
  );

  const playTracks = useCallback(
    async (tracks: PlayableTrack[], startIndex = 0) => {
      if (tracks.length === 0) return;
      setQueue(tracks);
      if (shuffled) {
        const order = generateShuffleOrder(tracks.length, startIndex);
        setShuffleOrder(order);
        setQueueIndex(0);
      } else {
        setQueueIndex(startIndex);
      }
      await startPlayback(tracks[startIndex]);
    },
    [startPlayback, shuffled],
  );

  const nextTrack = useCallback(async () => {
    if (streak?.active || queue.length <= 1) return;
    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    const effectiveIdx = shuffled
      ? (shuffleOrder[nextIdx] ?? nextIdx)
      : nextIdx;
    await startPlayback(queue[effectiveIdx]);
  }, [
    streak?.active,
    queue,
    queueIndex,
    shuffled,
    shuffleOrder,
    startPlayback,
  ]);

  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(async () => {
    if (streak?.active || queue.length <= 1) return;
    // If more than 3s into the song, restart current track
    const pos = sdkState?.position ?? progressMs;
    if (pos > 3000) {
      const effectiveIdx = shuffled
        ? (shuffleOrder[queueIndex] ?? queueIndex)
        : queueIndex;
      await startPlayback(queue[effectiveIdx]);
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    const effectiveIdx = shuffled
      ? (shuffleOrder[prevIdx] ?? prevIdx)
      : prevIdx;
    await startPlayback(queue[effectiveIdx]);
  }, [
    streak?.active,
    queue,
    queueIndex,
    shuffled,
    shuffleOrder,
    startPlayback,
    sdkState?.position,
    progressMs,
  ]);

  const toggleShuffle = useCallback(() => {
    if (queue.length <= 1) return;
    if (!shuffled) {
      // Turn on: generate shuffle, pin current track
      const currentEffective = queueIndex;
      const order = generateShuffleOrder(queue.length, currentEffective);
      setShuffleOrder(order);
      setQueueIndex(0); // current track is pinned at 0
    } else {
      // Turn off: map back to original order
      const effectiveIdx = shuffleOrder[queueIndex] ?? queueIndex;
      setQueueIndex(effectiveIdx);
      setShuffleOrder([]);
    }
    setShuffled((s) => !s);
  }, [queue.length, shuffled, queueIndex, shuffleOrder]);

  const togglePlay = useCallback(async () => {
    if (paused) {
      const res = await resume();

      if (res.ok) {
        setApiPaused(false);
        return;
      }

      // No active device — init SDK and play
      if (res.status === 404 && trackId) {
        initSpotify();
        const deviceId = await waitForReady();
        if (deviceId) {
          const playRes = await play(`spotify:track:${trackId}`, deviceId);
          if (playRes.ok) {
            if (streak) await setRepeat("track", deviceId);
            setApiPaused(false);
          }
        } else {
          toast.error(
            "Could not resume playback. Please open Spotify on a device and try again.",
          );
        }
      } else {
        toast.error(getPlaybackFailureMessage(res.status));
      }
    } else {
      const res = await pause();
      if (res.ok) {
        setApiPaused(true);
      } else {
        toast.error(getPlaybackFailureMessage(res.status));
      }
    }
  }, [
    paused,
    trackId,
    streak,
    resume,
    initSpotify,
    waitForReady,
    play,
    setRepeat,
    pause,
  ]);

  const setVolume = useCallback(
    async (val: number) => {
      setVolumeState(val);
      await setSpotifyVolume(val);
    },
    [setSpotifyVolume],
  );

  // --- Streak controls ---

  const lockIn = useCallback(async () => {
    const token = await getAccessToken();
    if (!token || !currentTrack) return;
    try {
      const res = await fetch("/api/ironman/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: currentTrack.id,
          trackName: currentTrack.name,
          trackArtist: currentTrack.artist,
          trackImage: currentTrack.albumImage,
          trackDuration: currentTrack.durationMs,
          playbackStarted: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        applyStreakState(data);
        broadcastStreakState(data);
        setCurrentTrack(null);
        await setRepeat("track");
      }
    } catch {}
  }, [
    applyStreakState,
    broadcastStreakState,
    getAccessToken,
    currentTrack,
    setRepeat,
  ]);

  const activateHardcore = useCallback(async () => {
    if (!streak?.active || streak.hardcore) return;
    try {
      const res = await fetch("/api/ironman/hardcore", { method: "POST" });
      if (res.ok) {
        const nextStreak = { ...streak, hardcore: true };
        applyStreakState(nextStreak);
        broadcastStreakState(nextStreak);
      }
    } catch {}
  }, [applyStreakState, broadcastStreakState, streak]);

  const surrender = useCallback(async () => {
    const res = await fetch("/api/ironman/surrender", { method: "POST" });
    if (res.ok) {
      if (streak) {
        setCurrentTrack({
          id: streak.trackId,
          name: streak.trackName,
          artist: streak.trackArtist,
          albumImage: streak.trackImage,
          durationMs: streak.trackDuration,
        });
        // Resume queue position if there was a queue
        if (queue.length > 1) {
          const idx = queue.findIndex((t) => t.id === streak.trackId);
          if (idx !== -1) {
            const effectiveQueueIdx = shuffled
              ? shuffleOrder.indexOf(idx)
              : idx;
            if (effectiveQueueIdx !== -1) setQueueIndex(effectiveQueueIdx);
          }
        }
        await setRepeat("off");
      }
      applyStreakState(null);
      broadcastStreakState(null);
    }
  }, [
    applyStreakState,
    broadcastStreakState,
    streak,
    queue,
    shuffled,
    shuffleOrder,
    setRepeat,
  ]);

  // --- Auto-play from challenge link ---

  useEffect(() => {
    const lockInTrackId = searchParams.get("lockIn");
    if (!lockInTrackId || !session || autoPlayAttempted.current) return;

    autoPlayAttempted.current = true;

    fetch(`/api/search?q=track:${lockInTrackId}`)
      .then((r) => r.json())
      .then((data: { tracks?: SpotifyTrack[] }) => {
        const match = (data.tracks ?? []).find((t) => t.id === lockInTrackId);
        if (match) playTrack(match);
      })
      .catch(() => {});
  }, [session, playTrack, searchParams]);

  // --- Auto-advance queue ---

  const prevSdkStateRef = useRef<SdkPlaybackState | null>(null);

  useEffect(() => {
    const prev = prevSdkStateRef.current;
    prevSdkStateRef.current = sdkState;

    if (streak?.active || queue.length <= 1 || !sdkState || !prev) return;
    if (prev.paused) return;

    const wasNearEnd = prev.position > prev.duration * 0.9;
    const resetToStart = sdkState.position < prev.duration * 0.1;
    const trackUnchanged = sdkState.trackId === prev.trackId;

    if (wasNearEnd && resetToStart && trackUnchanged) {
      nextTrackRef.current();
    }
  }, [sdkState, streak?.active, queue.length]);

  const actions = useMemo(
    () => ({
      isAuthenticated,
      playTrack,
      playTracks,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      setVolume,
      lockIn,
      activateHardcore,
      surrender,
      setExpanded,
      spotify: {
        init: initSpotify,
        waitForReady,
        play,
        setRepeat,
      },
    }),
    [
      isAuthenticated,
      playTrack,
      playTracks,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      setVolume,
      lockIn,
      activateHardcore,
      surrender,
      setExpanded,
      initSpotify,
      waitForReady,
      play,
      setRepeat,
    ],
  );

  const state = useMemo(
    () => ({
      currentTrack,
      sdkState,
      paused,
      progressMs,
      durationMs,
      volume,
      streak,
      count,
      expanded,
      palette,
      queue,
      queueIndex,
      shuffled,
      hasQueue,
    }),
    [
      currentTrack,
      sdkState,
      paused,
      progressMs,
      durationMs,
      volume,
      streak,
      count,
      expanded,
      palette,
      queue,
      queueIndex,
      shuffled,
      hasQueue,
    ],
  );

  return (
    <WebPlayerActionsContext.Provider value={actions}>
      <WebPlayerStateContext.Provider value={state}>
        {streak?.active && (
          <EnforcementEngine
            streak={streak}
            getCurrentlyPlaying={getCurrentlyPlaying}
            play={play}
            setRepeat={setRepeat}
            onCountUpdate={handleCountUpdate}
            onProgress={handleProgress}
            onWeakness={() => {}}
            onBroken={handleBroken}
            sdkState={sdkState}
          />
        )}
        {children}
        <div
          className={cn(
            "fixed inset-0 pointer-events-none transition-all z-45",
            expanded && "backdrop-blur-xs pointer-events-auto",
          )}
          onClick={() => setExpanded(false)}
        />
        <MiniPlayer />
        <StandardPlayer />
      </WebPlayerStateContext.Provider>
    </WebPlayerActionsContext.Provider>
  );
}
