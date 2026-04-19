import { useCallback, useEffect, useRef, type MutableRefObject } from "react";

import type {
  ReadyWaiter,
  SpotifyPlaybackState,
  SpotifyPlayer,
} from "./spotify-sdk-types";

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

export function useSpotifySdk({
  clearSdkState,
  getAccessToken,
  handlePlayerStateChange,
  tokenRef,
}: {
  clearSdkState: () => void;
  getAccessToken: () => Promise<string | null>;
  handlePlayerStateChange: (
    player: SpotifyPlayer,
    state: SpotifyPlaybackState | null,
  ) => void;
  tokenRef: MutableRefObject<string | null>;
}) {
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const readyWaitersRef = useRef<ReadyWaiter[]>([]);
  const queuedInitRef = useRef<(() => void) | null>(null);

  const resolveReadyWaiters = useCallback((deviceId: string | null) => {
    const waiters = readyWaitersRef.current;
    readyWaitersRef.current = [];
    for (const waiter of waiters) {
      clearTimeout(waiter.timeoutId);
      waiter.resolve(deviceId);
    }
  }, []);

  const clearPendingInit = useCallback(() => {
    if (pendingInit === queuedInitRef.current) {
      pendingInit = null;
    }
    queuedInitRef.current = null;
  }, []);

  useEffect(() => {
    loadSdkScript();
  }, []);

  const initRef = useRef<() => void>(undefined);
  const init = useCallback(() => {
    if (!tokenRef.current || playerRef.current) return;

    if (!window.Spotify) {
      console.warn("[web-player] SDK not loaded yet, queuing init");
      const queuedInit = () => {
        queuedInitRef.current = null;
        initRef.current?.();
      };
      queuedInitRef.current = queuedInit;
      pendingInit = queuedInit;
      return;
    }

    console.log("[web-player] creating player");
    const player = new window.Spotify.Player({
      name: "rooms.fm",
      getOAuthToken: (cb: (token: string) => void) => {
        void getAccessToken()
          .then((token) => {
            tokenRef.current = token;
            cb(token ?? "");
          })
          .catch((error) => {
            console.error("[web-player] token refresh failed:", error);
            tokenRef.current = null;
            cb("");
          });
      },
      volume: 0.5,
    });

    player.addListener("ready", (({ device_id }: { device_id: string }) => {
      console.log("[web-player] ready, device:", device_id);
      deviceIdRef.current = device_id;
      resolveReadyWaiters(device_id);
    }) as () => void);

    player.addListener("not_ready", (() => {
      console.log("[web-player] not ready");
      deviceIdRef.current = null;
      clearSdkState();
    }) as () => void);

    player.addListener("player_state_changed", ((
      state: SpotifyPlaybackState | null,
    ) => {
      handlePlayerStateChange(player, state);
    }) as () => void);

    player.addListener("initialization_error", (({
      message,
    }: {
      message: string;
    }) => {
      console.error("[web-player] init error:", message);
    }) as () => void);

    player.addListener("authentication_error", (({
      message,
    }: {
      message: string;
    }) => {
      console.error("[web-player] auth error:", message);
    }) as () => void);

    player.addListener("account_error", (({ message }: { message: string }) => {
      console.error("[web-player] account error:", message);
    }) as () => void);

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
          clearSdkState();
        }
      })
      .catch((error) => {
        console.error("[web-player] connect error:", error);
        if (playerRef.current === player) {
          player.disconnect();
          playerRef.current = null;
          deviceIdRef.current = null;
          resolveReadyWaiters(null);
          clearSdkState();
        }
      });
    playerRef.current = player;
  }, [
    clearSdkState,
    getAccessToken,
    handlePlayerStateChange,
    resolveReadyWaiters,
    tokenRef,
  ]);

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
    clearPendingInit();
    resolveReadyWaiters(null);
    playerRef.current?.disconnect();
    playerRef.current = null;
    deviceIdRef.current = null;
    clearSdkState();
  }, [clearPendingInit, clearSdkState, resolveReadyWaiters]);

  useEffect(() => {
    return () => {
      clearPendingInit();
      resolveReadyWaiters(null);
      playerRef.current?.disconnect();
      playerRef.current = null;
      deviceIdRef.current = null;
      clearSdkState();
    };
  }, [clearPendingInit, clearSdkState, resolveReadyWaiters]);

  return {
    disconnect,
    init,
    playerRef,
    waitForReady,
  };
}
