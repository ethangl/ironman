"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface SdkPlaybackState {
  position: number;
  duration: number;
  paused: boolean;
  trackId: string | null;
}

// Preload the SDK script globally (only once)
let sdkLoaded = false;

if (typeof window !== "undefined" && !window.onSpotifyWebPlaybackSDKReady) {
  window.onSpotifyWebPlaybackSDKReady = () => {
    console.log("[web-player] SDK ready");
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

export function useWebPlayer(accessToken: string | null) {
  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [sdkState, setSdkState] = useState<SdkPlaybackState | null>(null);
  const readyResolveRef = useRef<((id: string) => void) | null>(null);
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  // Preload SDK script when we have a token
  useEffect(() => {
    if (accessToken) loadSdkScript();
  }, [accessToken]);

  // init() MUST be synchronous — called in click handler for activateElement()
  const init = useCallback(() => {
    if (!accessTokenRef.current || playerRef.current) return;

    if (!window.Spotify) {
      console.warn("[web-player] SDK not loaded yet");
      return;
    }

    console.log("[web-player] creating player");
    const player = new window.Spotify.Player({
      name: "ironman.fm",
      // Always use latest token so SDK can re-auth after refresh
      getOAuthToken: (cb: (token: string) => void) => cb(accessTokenRef.current!),
      volume: 0.5,
    });

    player.addListener("ready", ({ device_id }: { device_id: string }) => {
      console.log("[web-player] ready, device:", device_id);
      deviceIdRef.current = device_id;
      setDeviceId(device_id);
      setReady(true);
      if (readyResolveRef.current) {
        readyResolveRef.current(device_id);
        readyResolveRef.current = null;
      }
    });

    player.addListener("not_ready", () => {
      console.log("[web-player] not ready");
      setReady(false);
    });

    player.addListener("player_state_changed", (state: any) => {
      if (!state) {
        setSdkState(null);
        return;
      }
      setSdkState({
        position: state.position,
        duration: state.duration,
        paused: state.paused,
        trackId: state.track_window?.current_track?.id ?? null,
      });
    });

    player.addListener("initialization_error", ({ message }: { message: string }) => {
      console.error("[web-player] init error:", message);
    });

    player.addListener("authentication_error", ({ message }: { message: string }) => {
      console.error("[web-player] auth error:", message);
    });

    player.addListener("account_error", ({ message }: { message: string }) => {
      console.error("[web-player] account error:", message);
    });

    // activateElement MUST be called synchronously during user gesture
    player.activateElement();
    player.connect().then((ok: boolean) =>
      console.log("[web-player] connect:", ok ? "ok" : "failed")
    );
    playerRef.current = player;
  }, []);

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
    playerRef.current?.disconnect();
    playerRef.current = null;
    deviceIdRef.current = null;
    setDeviceId(null);
    setReady(false);
    setSdkState(null);
  }, []);

  useEffect(() => {
    return () => {
      playerRef.current?.disconnect();
    };
  }, []);

  return { init, disconnect, waitForReady, deviceId, ready, sdkState, playerRef };
}
