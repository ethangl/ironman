"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// --- Spotify SDK types ---

interface SpotifyPlayerConstructorOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyPlaybackState {
  position: number;
  duration: number;
  paused: boolean;
  track_window?: { current_track?: { id: string } };
}

interface SpotifySDK {
  Player: new (options: SpotifyPlayerConstructorOptions) => SpotifyPlayer;
}

declare global {
  interface Window {
    Spotify: SpotifySDK;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  activateElement(): void;
  togglePlay(): Promise<void>;
  pause(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
  addListener(event: string, callback: (data: never) => void): void;
}

// --- Public types ---

export interface SdkPlaybackState {
  position: number;
  duration: number;
  paused: boolean;
  trackId: string | null;
}

export interface SpotifyPlayback {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists?: { name: string }[];
  } | null;
}

export interface PlayResult {
  ok: boolean;
  status: number;
}

// --- SDK script loading ---

let sdkLoaded = false;
let pendingInit: (() => void) | null = null;

if (typeof window !== "undefined" && !window.onSpotifyWebPlaybackSDKReady) {
  window.onSpotifyWebPlaybackSDKReady = () => {
    console.log("[web-player] SDK ready");
    if (pendingInit) {
      pendingInit();
      pendingInit = null;
    }
  };
}

function loadSdkScript() {
  if (sdkLoaded || typeof window === "undefined") return;
  sdkLoaded = true;
  const script = document.createElement("script");
  script.src = "https://sdk.scdn.co/spotify-player.js";
  script.async = true;
  document.body.appendChild(script);
}

// --- Hook ---

export function useSpotify({
  getAccessToken,
  tokenRef,
  trackId,
}: {
  getAccessToken: () => Promise<string | null>;
  tokenRef: React.MutableRefObject<string | null>;
  trackId: string | null;
}) {
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const [sdkState, setSdkState] = useState<SdkPlaybackState | null>(null);
  const sdkStateRef = useRef<SdkPlaybackState | null>(null);
  const readyResolveRef = useRef<((id: string) => void) | null>(null);
  const positionPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackIdRef = useRef(trackId);

  useEffect(() => {
    trackIdRef.current = trackId;
  }, [trackId]);

  const isSdkActive = useCallback(() => {
    const s = sdkStateRef.current;
    return !!(
      playerRef.current &&
      s &&
      trackIdRef.current &&
      s.trackId === trackIdRef.current
    );
  }, []);

  // --- SDK lifecycle ---

  const stopPositionPolling = useCallback(() => {
    if (positionPollRef.current) {
      clearInterval(positionPollRef.current);
      positionPollRef.current = null;
    }
  }, []);

  const startPositionPolling = useCallback(
    (player: SpotifyPlayer) => {
      stopPositionPolling();
      positionPollRef.current = setInterval(async () => {
        const state = await player.getCurrentState();
        if (!state) return;
        const mapped: SdkPlaybackState = {
          position: state.position,
          duration: state.duration,
          paused: state.paused,
          trackId: state.track_window?.current_track?.id ?? null,
        };
        sdkStateRef.current = mapped;
        setSdkState(mapped);
        if (state.paused) stopPositionPolling();
      }, 500);
    },
    [stopPositionPolling],
  );

  useEffect(() => {
    loadSdkScript();
  }, []);

  // init() MUST be synchronous — called in click handler for activateElement()
  const initRef = useRef<() => void>(undefined);
  const init = useCallback(() => {
    if (!tokenRef.current || playerRef.current) return;

    if (!window.Spotify) {
      console.warn("[web-player] SDK not loaded yet, queuing init");
      pendingInit = () => initRef.current?.();
      return;
    }

    console.log("[web-player] creating player");
    const player = new window.Spotify.Player({
      name: "ironman.fm",
      getOAuthToken: (cb: (token: string) => void) => cb(tokenRef.current!),
      volume: 0.5,
    });

    player.addListener(
      "ready",
      (({ device_id }: { device_id: string }) => {
        console.log("[web-player] ready, device:", device_id);
        deviceIdRef.current = device_id;
        if (readyResolveRef.current) {
          readyResolveRef.current(device_id);
          readyResolveRef.current = null;
        }
      }) as () => void,
    );

    player.addListener(
      "not_ready",
      (() => {
        console.log("[web-player] not ready");
      }) as () => void,
    );

    player.addListener(
      "player_state_changed",
      ((state: SpotifyPlaybackState | null) => {
        if (!state) {
          sdkStateRef.current = null;
          setSdkState(null);
          return;
        }
        const mapped: SdkPlaybackState = {
          position: state.position,
          duration: state.duration,
          paused: state.paused,
          trackId: state.track_window?.current_track?.id ?? null,
        };
        sdkStateRef.current = mapped;
        setSdkState(mapped);

        if (!state.paused) {
          startPositionPolling(player);
        } else {
          stopPositionPolling();
        }
      }) as () => void,
    );

    player.addListener(
      "initialization_error",
      (({ message }: { message: string }) => {
        console.error("[web-player] init error:", message);
      }) as () => void,
    );

    player.addListener(
      "authentication_error",
      (({ message }: { message: string }) => {
        console.error("[web-player] auth error:", message);
      }) as () => void,
    );

    player.addListener(
      "account_error",
      (({ message }: { message: string }) => {
        console.error("[web-player] account error:", message);
      }) as () => void,
    );

    player.activateElement();
    player
      .connect()
      .then((ok: boolean) =>
        console.log("[web-player] connect:", ok ? "ok" : "failed"),
      );
    playerRef.current = player;
  }, [tokenRef, startPositionPolling, stopPositionPolling]);
  useEffect(() => {
    initRef.current = init;
  }, [init]);

  const waitForReady = useCallback((): Promise<string | null> => {
    if (deviceIdRef.current) return Promise.resolve(deviceIdRef.current);

    return new Promise((resolve) => {
      readyResolveRef.current = resolve;
      setTimeout(() => {
        readyResolveRef.current = null;
        resolve(null);
      }, 8000);
    });
  }, []);

  const disconnect = useCallback(() => {
    pendingInit = null;
    stopPositionPolling();
    playerRef.current?.disconnect();
    playerRef.current = null;
    deviceIdRef.current = null;
    sdkStateRef.current = null;
    setSdkState(null);
  }, [stopPositionPolling]);

  useEffect(() => {
    return () => {
      stopPositionPolling();
      playerRef.current?.disconnect();
    };
  }, [stopPositionPolling]);

  // --- Spotify Web API methods ---

  const play = useCallback(
    async (uri: string, deviceId?: string): Promise<PlayResult> => {
      const token = await getAccessToken();
      if (!token) return { ok: false, status: 0 };
      const url = deviceId
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : "https://api.spotify.com/v1/me/player/play";
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [uri] }),
      });
      return { ok: res.ok || res.status === 204, status: res.status };
    },
    [getAccessToken],
  );

  const resume = useCallback(async (): Promise<PlayResult> => {
    if (isSdkActive()) {
      await playerRef.current!.togglePlay();
      return { ok: true, status: 200 };
    }
    const token = await getAccessToken();
    if (!token) return { ok: false, status: 0 };
    const res = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: res.ok || res.status === 204, status: res.status };
  }, [getAccessToken, isSdkActive]);

  const pause = useCallback(async () => {
    if (isSdkActive()) {
      await playerRef.current!.pause();
      return;
    }
    const token = await getAccessToken();
    if (!token) return;
    try {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  }, [getAccessToken, isSdkActive]);

  const setVolume = useCallback(
    async (percent: number) => {
      if (isSdkActive()) {
        await playerRef.current!.setVolume(percent / 100);
        return;
      }
      const token = await getAccessToken();
      if (!token) return;
      try {
        await fetch(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=${percent}`,
          { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
        );
      } catch {}
    },
    [getAccessToken, isSdkActive],
  );

  const setRepeat = useCallback(
    async (state: string, deviceId?: string) => {
      const token = await getAccessToken();
      if (!token) return;
      const url = deviceId
        ? `https://api.spotify.com/v1/me/player/repeat?state=${state}&device_id=${deviceId}`
        : `https://api.spotify.com/v1/me/player/repeat?state=${state}`;
      try {
        await fetch(url, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    },
    [getAccessToken],
  );

  const getCurrentlyPlaying = useCallback(async (): Promise<{
    status: number;
    playback: SpotifyPlayback | null;
  }> => {
    const token = await getAccessToken();
    if (!token) return { status: 0, playback: null };
    try {
      const res = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok && res.status !== 204 && res.status !== 202) {
        return { status: res.status, playback: null };
      }
      if (res.status === 204 || res.status === 202) {
        return { status: res.status, playback: null };
      }
      const playback = await res.json();
      return { status: res.status, playback };
    } catch {
      return { status: 0, playback: null };
    }
  }, [getAccessToken]);

  return {
    // SDK lifecycle
    init,
    disconnect,
    waitForReady,

    // Playback
    play,
    resume,
    pause,
    setVolume,
    setRepeat,
    getCurrentlyPlaying,

    // State
    sdkState,
  };
}
