"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { EnforcementEngine } from "@/components/player/enforcement-engine";
import { NowPlayingBar } from "@/components/player/now-playing-bar";
import { useSpotify } from "@/hooks/use-spotify";
import { WebPlayerContext } from "@/hooks/use-web-player";
import { authClient, useSession } from "@/lib/auth-client";
import { SpotifyTrack, StreakData } from "@/types";

export function WebPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const tokenRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const autoPlayAttempted = useRef(false);

  // Track & streak state
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  // Playback state
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [apiPaused, setApiPaused] = useState(true);
  const [volume, setVolumeState] = useState(50);

  const trackId = streak?.trackId ?? currentTrack?.id ?? null;

  const getAccessToken = useCallback(async () => {
    const res = await authClient.getAccessToken({ providerId: "spotify" });
    tokenRef.current = res.data?.accessToken ?? null;
    return tokenRef.current;
  }, []);

  const spotify = useSpotify({ getAccessToken, tokenRef, trackId });

  const paused = spotify.sdkState ? spotify.sdkState.paused : apiPaused;

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
    setStreak(null);
  }, []);

  // --- Playback controls ---

  const playTrack = useCallback(
    async (track: SpotifyTrack) => {
      const token = await getAccessToken();
      if (!token) return;

      spotify.init();
      setCurrentTrack(track);

      const uri = `spotify:track:${track.id}`;
      const res = await spotify.play(uri);

      if (res.ok) return;

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
            if (playRes.ok) return;
          } catch {}
        }

        alert(
          "Could not start playback. Please open Spotify on a device and try again.",
        );
        setCurrentTrack(null);
      }
    },
    [getAccessToken, spotify],
  );

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
  }, [paused, trackId, streak, spotify]);

  const setVolume = useCallback(
    async (val: number) => {
      setVolumeState(val);
      await spotify.setVolume(val);
    },
    [spotify],
  );

  // --- Streak controls ---

  const lockIn = useCallback(
    async (hardcore = false) => {
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
            hardcore,
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
    },
    [getAccessToken, currentTrack, spotify],
  );

  const surrender = useCallback(async () => {
    const res = await fetch("/api/ironman/surrender", { method: "POST" });
    if (res.ok) {
      await spotify.pause();
      setStreak(null);
    }
  }, [spotify]);

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

  return (
    <WebPlayerContext.Provider
      value={{
        isAuthenticated: !!session,
        playTrack,
        togglePlay,
        setVolume,
        currentTrack,
        sdkState: spotify.sdkState,
        paused,
        progressMs,
        durationMs,
        volume,
        streak,
        count,
        lockIn,
        surrender,
        spotify: {
          init: spotify.init,
          waitForReady: spotify.waitForReady,
          play: spotify.play,
          setRepeat: spotify.setRepeat,
        },
      }}
    >
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
      <NowPlayingBar />
    </WebPlayerContext.Provider>
  );
}
