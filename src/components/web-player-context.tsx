"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useWebPlayer, type SdkPlaybackState } from "./web-player";

interface WebPlayerContextValue {
  accessToken: string | null;
  refreshToken: () => Promise<string | null>;
  sdkState: SdkPlaybackState | null;
  playerRef: React.RefObject<any>;
  initWebPlayer: () => void;
  waitForReady: () => Promise<string | null>;
  disconnectWebPlayer: () => void;
}

const WebPlayerContext = createContext<WebPlayerContextValue | null>(null);

export function WebPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { init, disconnect, waitForReady, sdkState, playerRef } =
    useWebPlayer(accessToken);

  const refreshToken = useCallback(async () => {
    const res = await authClient.getAccessToken({ providerId: "spotify" });
    if (res.data) setAccessToken(res.data.accessToken);
    return res.data?.accessToken ?? null;
  }, []);

  useEffect(() => {
    if (session) refreshToken();
  }, [session, refreshToken]);

  return (
    <WebPlayerContext.Provider
      value={{
        accessToken,
        refreshToken,
        sdkState,
        playerRef,
        initWebPlayer: init,
        waitForReady,
        disconnectWebPlayer: disconnect,
      }}
    >
      {children}
    </WebPlayerContext.Provider>
  );
}

export function useWebPlayerContext() {
  const ctx = useContext(WebPlayerContext);
  if (!ctx) throw new Error("useWebPlayerContext must be used within WebPlayerProvider");
  return ctx;
}
