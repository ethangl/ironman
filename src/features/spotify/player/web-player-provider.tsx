import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSpotifyClient } from "@/features/spotify/client";
import { EnforcementEngine, useIronmanPlayerActions } from "@/features/ironman";
import { useBrowserSearchParams } from "@/hooks/use-browser-search-params";
import {
  WebPlayerActionsContext,
  WebPlayerStateContext,
} from "./use-web-player";
import { cn } from "@/lib/utils";
import { useAppAuth, useAppCapabilities, useIronmanClient } from "@/app";
import { useEnsureTrackAudioFeatures } from "@/features/reccobeats";
import { useSpotifyActivity } from "@/features/spotify/activity";
import { StreakData, Track } from "@/types";
import type { SpotifyTrack } from "@/types";
import { MiniPlayer } from "./mini-player";
import { StandardPlayer } from "./standard-player";
import { useChallengeAutoplay } from "./use-challenge-autoplay";
import { usePlayerPalette } from "./use-player-palette";
import { usePlayerPlayback } from "./use-player-playback";
import { useSpotify } from "../sdk/use-spotify";
import { useStreakSync } from "./use-streak-sync";

export function WebPlayerProvider({ children }: { children: React.ReactNode }) {
  const spotifyClient = useSpotifyClient();
  const ironmanClient = useIronmanClient();
  const { session, getSpotifyAccessToken } = useAppAuth();
  const { canControlPlayback, canUseIronman } = useAppCapabilities();
  const { appendRecentTrack } = useSpotifyActivity();
  const tokenRef = useRef<string | null>(null);
  const searchParams = useBrowserSearchParams();
  const hasSession = !!session;

  // Track & streak state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [count, setCount] = useState(0);
  const streakRef = useRef<StreakData | null>(null);

  // Playback state
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    tokenRef.current = null;
  }, [session?.user.id]);

  const refreshAccessToken = useCallback(async () => {
    const token = await getSpotifyAccessToken();
    tokenRef.current = token;
    return token;
  }, [getSpotifyAccessToken]);

  const getAccessToken = useCallback(async () => {
    if (tokenRef.current) {
      return tokenRef.current;
    }

    return refreshAccessToken();
  }, [refreshAccessToken]);
  const isStreakActive = !!streak?.active;
  const trackId = streak?.trackId ?? currentTrack?.id ?? null;
  const lockInTrackId = searchParams.get("lockIn");

  const spotify = useSpotify({
    getAccessToken: refreshAccessToken,
    tokenRef,
    trackId,
  });
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
  const {
    clearPlaybackAfterBrokenStreak,
    hasQueue,
    nextTrack,
    paused,
    playTrack,
    playTracks,
    prevTrack,
    queue,
    queueIndex,
    restoreTrackAfterSurrender,
    setVolume,
    shuffled,
    togglePlay,
    toggleShuffle,
    volume,
  } = usePlayerPlayback({
    canControlPlayback,
    currentTrack,
    getAccessToken,
    initSpotify,
    pause,
    play,
    progressMs,
    resume,
    sdkState,
    setCurrentTrack,
    setRepeat,
    setSpotifyVolume,
    streakActive: isStreakActive,
    streakTrackId: streak?.trackId ?? null,
    waitForReady,
  });
  const artworkUrl = streak?.trackImage ?? currentTrack?.albumImage ?? null;
  const palette = usePlayerPalette(artworkUrl);
  useEnsureTrackAudioFeatures(hasSession ? trackId : null);

  const applyStreakState = useCallback((nextStreak: StreakData | null) => {
    streakRef.current = nextStreak;
    setStreak(nextStreak);
    if (nextStreak) {
      setCount(nextStreak.count);
      setDurationMs(nextStreak.trackDuration);
      return;
    }

    setCount(0);
    setDurationMs(0);
  }, []);

  const fetchStreakStatus =
    useCallback(async (): Promise<StreakData | null> => {
      return ironmanClient.getStatus();
    }, [ironmanClient]);

  const { broadcastStreakState } = useStreakSync({
    applyStreakState,
    getStatus: fetchStreakStatus,
    hasSession,
  });

  const pendingRecentTrackRef = useRef<SpotifyTrack | null>(null);
  const prevCurrentTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentTrack || prevCurrentTrackIdRef.current === currentTrack.id) {
      prevCurrentTrackIdRef.current = currentTrack?.id ?? null;
      return;
    }

    const albumNameValue = (currentTrack as Partial<SpotifyTrack>).albumName;
    const albumName = typeof albumNameValue === "string" ? albumNameValue : "";
    pendingRecentTrackRef.current = {
      ...currentTrack,
      albumName,
    };
    prevCurrentTrackIdRef.current = currentTrack.id;
  }, [currentTrack]);

  useEffect(() => {
    const confirmedTrackId = !sdkState?.paused ? sdkState?.trackId ?? null : null;

    if (!confirmedTrackId) {
      return;
    }

    const pendingTrack = pendingRecentTrackRef.current;
    if (pendingTrack && pendingTrack.id === confirmedTrackId) {
      appendRecentTrack(pendingTrack);
      pendingRecentTrackRef.current = null;
    }
  }, [appendRecentTrack, sdkState]);

  // --- Enforcement callbacks ---

  const handleCountUpdate = useCallback(
    (newCount: number) => {
      if (!streakRef.current) return;

      const nextStreak = { ...streakRef.current, count: newCount };
      applyStreakState(nextStreak);
      broadcastStreakState(nextStreak);
    },
    [applyStreakState, broadcastStreakState],
  );

  const handleProgress = useCallback((p: number, d: number) => {
    setProgressMs(p);
    setDurationMs(d);
  }, []);

  const { activateHardcore, handleBroken, lockIn, surrender } =
    useIronmanPlayerActions({
      applyStreakState,
      broadcastStreakState,
      canUseIronman,
      clearPlaybackAfterBrokenStreak,
      currentTrack,
      getAccessToken,
      ironmanClient,
      restoreTrackAfterSurrender,
      setCurrentTrack,
      setRepeat,
      streak,
    });

  useChallengeAutoplay({
    canControlPlayback,
    hasSession,
    lockInTrackId,
    playTrack,
    searchTracks: spotifyClient.search.searchTracks,
  });

  const actions = useMemo(
    () => ({
      isAuthenticated: canControlPlayback,
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
      canControlPlayback,
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
        {isStreakActive && (
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
