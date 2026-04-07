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

interface ReadyWaiter {
  resolve: (deviceId: string | null) => void;
  timeoutId: ReturnType<typeof setTimeout>;
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

function logSpotifyControlWrite(details: {
  action: "play" | "resume" | "pause" | "repeat" | "volume";
  source: "sdk" | "api";
  status: number;
  durationMs: number;
  endpoint?: string;
  extra?: Record<string, string | number | boolean | null | undefined>;
}) {
  if (process.env.NODE_ENV === "test") return;

  const parts = [
    `[spotify-control] ${details.action}`,
    `source=${details.source}`,
    `status=${details.status}`,
    `duration=${details.durationMs}ms`,
  ];

  if (details.endpoint) {
    parts.push(`endpoint=${details.endpoint}`);
  }

  if (details.extra) {
    for (const [key, value] of Object.entries(details.extra)) {
      if (value === undefined || value === null) continue;
      parts.push(`${key}=${value}`);
    }
  }

  console.info(parts.join(" "));
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
  const readyWaitersRef = useRef<ReadyWaiter[]>([]);
  const positionPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionPollInFlightRef = useRef(false);
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
    positionPollInFlightRef.current = false;
  }, []);

  const resolveReadyWaiters = useCallback((deviceId: string | null) => {
    const waiters = readyWaitersRef.current;
    readyWaitersRef.current = [];
    for (const waiter of waiters) {
      clearTimeout(waiter.timeoutId);
      waiter.resolve(deviceId);
    }
  }, []);

  const startPositionPolling = useCallback(
    (player: SpotifyPlayer) => {
      stopPositionPolling();
      positionPollRef.current = setInterval(async () => {
        if (positionPollInFlightRef.current) return;
        positionPollInFlightRef.current = true;
        const state = await player.getCurrentState();
        try {
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
        } finally {
          positionPollInFlightRef.current = false;
        }
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
        resolveReadyWaiters(device_id);
      }) as () => void,
    );

    player.addListener(
      "not_ready",
      (() => {
        console.log("[web-player] not ready");
        deviceIdRef.current = null;
        sdkStateRef.current = null;
        setSdkState(null);
        stopPositionPolling();
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
      .then((ok: boolean) => {
        console.log("[web-player] connect:", ok ? "ok" : "failed");
        if (!ok && playerRef.current === player) {
          player.disconnect();
          playerRef.current = null;
          deviceIdRef.current = null;
          resolveReadyWaiters(null);
        }
      })
      .catch((error) => {
        console.error("[web-player] connect error:", error);
        if (playerRef.current === player) {
          player.disconnect();
          playerRef.current = null;
          deviceIdRef.current = null;
          resolveReadyWaiters(null);
        }
      });
    playerRef.current = player;
  }, [resolveReadyWaiters, tokenRef, startPositionPolling, stopPositionPolling]);
  useEffect(() => {
    initRef.current = init;
  }, [init]);

  const waitForReady = useCallback((): Promise<string | null> => {
    if (deviceIdRef.current) return Promise.resolve(deviceIdRef.current);

    return new Promise((resolve) => {
      const waiter: ReadyWaiter = {
        resolve,
        timeoutId: setTimeout(() => {
          readyWaitersRef.current = readyWaitersRef.current.filter(
            (pendingWaiter) => pendingWaiter !== waiter,
          );
          resolve(null);
        }, 8000),
      };
      readyWaitersRef.current.push(waiter);
    });
  }, []);

  const disconnect = useCallback(() => {
    pendingInit = null;
    stopPositionPolling();
    resolveReadyWaiters(null);
    playerRef.current?.disconnect();
    playerRef.current = null;
    deviceIdRef.current = null;
    sdkStateRef.current = null;
    setSdkState(null);
  }, [resolveReadyWaiters, stopPositionPolling]);

  useEffect(() => {
    return () => {
      stopPositionPolling();
      resolveReadyWaiters(null);
      playerRef.current?.disconnect();
    };
  }, [resolveReadyWaiters, stopPositionPolling]);

  // --- Spotify Web API methods ---

  const play = useCallback(
    async (uri: string, deviceId?: string): Promise<PlayResult> => {
      const startedAt = Date.now();
      const token = await getAccessToken();
      if (!token) {
        logSpotifyControlWrite({
          action: "play",
          source: "api",
          status: 0,
          durationMs: Date.now() - startedAt,
          endpoint: "/me/player/play",
          extra: { device_id: deviceId ?? null, uri },
        });
        return { ok: false, status: 0 };
      }
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
      logSpotifyControlWrite({
        action: "play",
        source: "api",
        status: res.status,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/play",
        extra: { device_id: deviceId ?? null, uri },
      });
      return { ok: res.ok || res.status === 204, status: res.status };
    },
    [getAccessToken],
  );

  const resume = useCallback(async (): Promise<PlayResult> => {
    const startedAt = Date.now();
    if (isSdkActive()) {
      await playerRef.current!.togglePlay();
      logSpotifyControlWrite({
        action: "resume",
        source: "sdk",
        status: 200,
        durationMs: Date.now() - startedAt,
      });
      return { ok: true, status: 200 };
    }
    const token = await getAccessToken();
    if (!token) {
      logSpotifyControlWrite({
        action: "resume",
        source: "api",
        status: 0,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/play",
      });
      return { ok: false, status: 0 };
    }
    const res = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    logSpotifyControlWrite({
      action: "resume",
      source: "api",
      status: res.status,
      durationMs: Date.now() - startedAt,
      endpoint: "/me/player/play",
    });
    return { ok: res.ok || res.status === 204, status: res.status };
  }, [getAccessToken, isSdkActive]);

  const pause = useCallback(async (): Promise<PlayResult> => {
    const startedAt = Date.now();
    if (isSdkActive()) {
      await playerRef.current!.pause();
      logSpotifyControlWrite({
        action: "pause",
        source: "sdk",
        status: 200,
        durationMs: Date.now() - startedAt,
      });
      return { ok: true, status: 200 };
    }
    const token = await getAccessToken();
    if (!token) {
      logSpotifyControlWrite({
        action: "pause",
        source: "api",
        status: 0,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/pause",
      });
      return { ok: false, status: 0 };
    }
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      logSpotifyControlWrite({
        action: "pause",
        source: "api",
        status: res.status,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/pause",
      });
      return { ok: res.ok || res.status === 204, status: res.status };
    } catch {
      logSpotifyControlWrite({
        action: "pause",
        source: "api",
        status: 0,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/pause",
      });
      return { ok: false, status: 0 };
    }
  }, [getAccessToken, isSdkActive]);

  const setVolume = useCallback(
    async (percent: number) => {
      const startedAt = Date.now();
      if (isSdkActive()) {
        await playerRef.current!.setVolume(percent / 100);
        logSpotifyControlWrite({
          action: "volume",
          source: "sdk",
          status: 200,
          durationMs: Date.now() - startedAt,
          extra: { percent },
        });
        return;
      }
      const token = await getAccessToken();
      if (!token) {
        logSpotifyControlWrite({
          action: "volume",
          source: "api",
          status: 0,
          durationMs: Date.now() - startedAt,
          endpoint: "/me/player/volume",
          extra: { percent },
        });
        return;
      }
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=${percent}`,
          { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
        );
        logSpotifyControlWrite({
          action: "volume",
          source: "api",
          status: res.status,
          durationMs: Date.now() - startedAt,
          endpoint: "/me/player/volume",
          extra: { percent },
        });
      } catch {
        logSpotifyControlWrite({
          action: "volume",
          source: "api",
          status: 0,
          durationMs: Date.now() - startedAt,
          endpoint: "/me/player/volume",
          extra: { percent },
        });
      }
    },
    [getAccessToken, isSdkActive],
  );

  const setRepeat = useCallback(
    async (state: string, deviceId?: string) => {
      const startedAt = Date.now();
      const token = await getAccessToken();
      if (!token) {
        logSpotifyControlWrite({
          action: "repeat",
          source: "api",
          status: 0,
          durationMs: Date.now() - startedAt,
          endpoint: "/me/player/repeat",
          extra: { state, device_id: deviceId ?? null },
        });
        return;
      }
      const url = deviceId
        ? `https://api.spotify.com/v1/me/player/repeat?state=${state}&device_id=${deviceId}`
        : `https://api.spotify.com/v1/me/player/repeat?state=${state}`;
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        logSpotifyControlWrite({
          action: "repeat",
          source: "api",
          status: res.status,
          durationMs: Date.now() - startedAt,
          endpoint: "/me/player/repeat",
          extra: { state, device_id: deviceId ?? null },
        });
      } catch {
        logSpotifyControlWrite({
          action: "repeat",
          source: "api",
          status: 0,
          durationMs: Date.now() - startedAt,
          endpoint: "/me/player/repeat",
          extra: { state, device_id: deviceId ?? null },
        });
      }
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
