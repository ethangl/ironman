"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EnforcementEngine } from "@/components/player/enforcement-engine";
import { useSpotify } from "@/hooks/use-spotify";
import {
  WebPlayerActionsContext,
  WebPlayerStateContext,
} from "@/hooks/use-web-player";
import { authClient, useSession } from "@/lib/auth-client";
import { PlayableTrack, SpotifyTrack, StreakData } from "@/types";
import { SdkPlaybackState } from "@/hooks/use-spotify";
import { MiniPlayer } from "./mini-player";
import { StandardPlayer } from "./standard-player";

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

  const getEffectiveIndex = useCallback(
    (idx: number) => (shuffled ? shuffleOrder[idx] ?? idx : idx),
    [shuffled, shuffleOrder],
  );

  const trackId = streak?.trackId ?? currentTrack?.id ?? null;
  const artworkUrl = streak?.trackImage ?? currentTrack?.albumImage ?? null;

  const getAccessToken = useCallback(async () => {
    const res = await authClient.getAccessToken({ providerId: "spotify" });
    tokenRef.current = res.data?.accessToken ?? null;
    return tokenRef.current;
  }, []);

  const spotify = useSpotify({ getAccessToken, tokenRef, trackId });

  const paused = spotify.sdkState ? spotify.sdkState.paused : apiPaused;

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

  // --- Streak polling ---

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
    const interval = setInterval(check, 2_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // --- Enforcement callbacks ---

  const handleCountUpdate = useCallback((newCount: number) => {
    countRef.current = newCount;
    setCount(newCount);
  }, []);

  const handleProgress = useCallback((p: number, d: number) => {
    setProgressMs(p);
    setDurationMs(d);
  }, []);

  const handleBroken = useCallback(() => {
    console.log("[web-player] streak broken — ending");
    spotify.pause();
    setStreak(null);
    setCurrentTrack(null);
    setQueue([]);
    setQueueIndex(0);
  }, [spotify.pause]);

  // --- Playback controls ---

  const startPlayback = useCallback(
    async (track: PlayableTrack) => {
      const token = await getAccessToken();
      if (!token) return;

      spotify.init();
      setCurrentTrack(track);

      const uri = `spotify:track:${track.id}`;
      const res = await spotify.play(uri);

      if (res.ok) {
        setApiPaused(false);
        return;
      }

      // No active device — fall back to SDK
      if (res.status === 404) {
        const sdkDeviceId = await spotify.waitForReady();
        if (!sdkDeviceId) {
          alert(
            "Could not start playback. Please open Spotify on a device and try again.",
          );
          setCurrentTrack(null);
          return;
        }

        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
          try {
            const playRes = await spotify.play(uri, sdkDeviceId);
            if (playRes.ok) {
              setApiPaused(false);
              return;
            }
          } catch {}
        }

        alert(
          "Could not start playback. Please open Spotify on a device and try again.",
        );
        setCurrentTrack(null);
      }
    },
    [getAccessToken, spotify.init, spotify.play, spotify.waitForReady],
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
    const effectiveIdx = shuffled ? shuffleOrder[nextIdx] ?? nextIdx : nextIdx;
    await startPlayback(queue[effectiveIdx]);
  }, [streak?.active, queue, queueIndex, shuffled, shuffleOrder, startPlayback]);

  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(async () => {
    if (streak?.active || queue.length <= 1) return;
    // If more than 3s into the song, restart current track
    const pos = spotify.sdkState?.position ?? progressMs;
    if (pos > 3000) {
      const effectiveIdx = shuffled ? shuffleOrder[queueIndex] ?? queueIndex : queueIndex;
      await startPlayback(queue[effectiveIdx]);
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    const effectiveIdx = shuffled ? shuffleOrder[prevIdx] ?? prevIdx : prevIdx;
    await startPlayback(queue[effectiveIdx]);
  }, [streak?.active, queue, queueIndex, shuffled, shuffleOrder, startPlayback, spotify.sdkState?.position, progressMs]);

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
      const res = await spotify.resume();

      if (res.ok) {
        setApiPaused(false);
        return;
      }

      // No active device — init SDK and play
      if (res.status === 404 && trackId) {
        spotify.init();
        const deviceId = await spotify.waitForReady();
        if (deviceId) {
          const playRes = await spotify.play(
            `spotify:track:${trackId}`,
            deviceId,
          );
          if (playRes.ok) {
            if (streak) await spotify.setRepeat("track", deviceId);
            setApiPaused(false);
          }
        }
      }
    } else {
      await spotify.pause();
      setApiPaused(true);
    }
  }, [paused, trackId, streak, spotify.resume, spotify.init, spotify.waitForReady, spotify.play, spotify.setRepeat, spotify.pause]);

  const setVolume = useCallback(
    async (val: number) => {
      setVolumeState(val);
      await spotify.setVolume(val);
    },
    [spotify.setVolume],
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
        setStreak(data);
        setCount(data.count);
        countRef.current = data.count;
        setDurationMs(data.trackDuration);
        setCurrentTrack(null);
        await spotify.setRepeat("track");
      }
    } catch {}
  }, [getAccessToken, currentTrack, spotify.setRepeat]);

  const activateHardcore = useCallback(async () => {
    if (!streak?.active || streak.hardcore) return;
    try {
      const res = await fetch("/api/ironman/hardcore", { method: "POST" });
      if (res.ok) {
        setStreak({ ...streak, hardcore: true });
      }
    } catch {}
  }, [streak]);

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
          await spotify.setRepeat("off");
        }
      }
      setStreak(null);
    }
  }, [streak, queue, shuffled, shuffleOrder, spotify.setRepeat]);

  // --- Auto-play from challenge link ---

  useEffect(() => {
    const lockInTrackId = searchParams.get("lockIn");
    if (!lockInTrackId || !session || autoPlayAttempted.current) return;

    autoPlayAttempted.current = true;

    fetch(`/api/search?q=track:${lockInTrackId}`)
      .then((r) => r.json())
      .then((tracks: SpotifyTrack[]) => {
        const match = tracks.find((t) => t.id === lockInTrackId);
        if (match) playTrack(match);
      })
      .catch(() => {});
  }, [session, playTrack, searchParams]);

  // --- Auto-advance queue ---

  const prevSdkStateRef = useRef<SdkPlaybackState | null>(null);

  useEffect(() => {
    const prev = prevSdkStateRef.current;
    prevSdkStateRef.current = spotify.sdkState;

    if (streak?.active || queue.length <= 1 || !spotify.sdkState || !prev) return;
    if (prev.paused) return;

    const wasNearEnd = prev.position > prev.duration * 0.9;
    const resetToStart = spotify.sdkState.position < prev.duration * 0.1;
    const trackUnchanged = spotify.sdkState.trackId === prev.trackId;

    if (wasNearEnd && resetToStart && trackUnchanged) {
      nextTrackRef.current();
    }
  }, [spotify.sdkState, streak?.active, queue.length]);

  const actions = useMemo(
    () => ({
      isAuthenticated: !!session,
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
        init: spotify.init,
        waitForReady: spotify.waitForReady,
        play: spotify.play,
        setRepeat: spotify.setRepeat,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!session, playTrack, playTracks, nextTrack, prevTrack, togglePlay, toggleShuffle, setVolume, lockIn, activateHardcore, surrender, setExpanded, spotify.init, spotify.waitForReady, spotify.play, spotify.setRepeat],
  );

  const state = useMemo(
    () => ({
      currentTrack,
      sdkState: spotify.sdkState,
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
    [currentTrack, spotify.sdkState, paused, progressMs, durationMs, volume, streak, count, expanded, palette, queue, queueIndex, shuffled, hasQueue],
  );

  return (
    <WebPlayerActionsContext.Provider value={actions}>
      <WebPlayerStateContext.Provider value={state}>
        {streak?.active && (
          <EnforcementEngine
            streak={streak}
            getCurrentlyPlaying={spotify.getCurrentlyPlaying}
            play={spotify.play}
            setRepeat={spotify.setRepeat}
            onCountUpdate={handleCountUpdate}
            onProgress={handleProgress}
            onWeakness={() => {}}
            onBroken={handleBroken}
            sdkState={spotify.sdkState}
          />
        )}
        {children}
        <MiniPlayer />
        <StandardPlayer />
      </WebPlayerStateContext.Provider>
    </WebPlayerActionsContext.Provider>
  );
}
