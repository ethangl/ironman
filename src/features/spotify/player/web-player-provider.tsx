import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppAuth, useAppCapabilities } from "@/app";
import { useSpotifyRecentlyPlayed } from "@/features/spotify/activity";
import type { SpotifyTrack, Track } from "@/types";
import { cn } from "@/lib/utils";
import { useSpotify } from "../sdk/use-spotify";
import { MiniPlayer } from "./mini-player";
import { StandardPlayer } from "./standard-player";
import { usePlayerPalette } from "./use-player-palette";
import { usePlayerPlayback } from "./use-player-playback";
import {
  WebPlayerActionsContext,
  WebPlayerStateContext,
} from "./use-web-player";

export function WebPlayerProvider({ children }: { children: React.ReactNode }) {
  const { session, getSpotifyAccessToken } = useAppAuth();
  const { canControlPlayback } = useAppCapabilities();
  const { appendRecentTrack } = useSpotifyRecentlyPlayed();
  const tokenRef = useRef<string | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
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

  const spotify = useSpotify({
    getAccessToken: refreshAccessToken,
    tokenRef,
    trackId: currentTrack?.id ?? null,
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
  } = spotify;

  useEffect(() => {
    if (!sdkState) {
      return;
    }

    setProgressMs(sdkState.position);
    setDurationMs(sdkState.duration);
  }, [sdkState]);

  const {
    hasQueue,
    nextTrack,
    paused,
    playTrack,
    playTracks,
    prevTrack,
    queue,
    queueIndex,
    setVolume,
    shuffled,
    syncTrack,
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
    setSpotifyVolume,
    waitForReady,
  });

  const artworkUrl = currentTrack?.albumImage ?? null;
  const palette = usePlayerPalette(artworkUrl);

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

  const actions = useMemo(
    () => ({
      isAuthenticated: canControlPlayback,
      playTrack,
      playTracks,
      syncTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      setVolume,
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
      syncTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      setVolume,
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
