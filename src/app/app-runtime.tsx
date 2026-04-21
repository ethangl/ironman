import {
  convexSignIn as signIn,
  convexSignOut as signOut,
  useConvexSession,
} from "@/lib/convex-auth-client";
import { useSpotifyRuntimeCapabilities } from "@/features/spotify-client/use-spotify-runtime-capabilities";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useSettledSession } from "./use-settled-session";

type SessionState = ReturnType<typeof useConvexSession>;
export type SessionData = SessionState["data"];
export type SpotifyConnection = "unknown" | "connected" | "disconnected";

export interface AppAuthRuntime {
  session: SessionData;
  isPending: boolean;
  isAuthenticated: boolean;
  signIn: typeof signIn;
  signOut: typeof signOut;
  getSpotifyAccessToken: () => Promise<string | null>;
}

export interface AppCapabilities {
  spotifyConnection: SpotifyConnection;
  canControlPlayback: boolean;
}

const AppAuthContext = createContext<AppAuthRuntime | null>(null);
const AppCapabilitiesContext = createContext<AppCapabilities | null>(null);

function useRuntimeValues() {
  const { effectiveSession, isSessionPending } = useSettledSession();
  const sessionUserId = effectiveSession?.user.id ?? null;
  const {
    canControlPlayback,
    getSpotifyAccessToken,
    spotifyConnection,
  } = useSpotifyRuntimeCapabilities(sessionUserId);

  const auth = useMemo(
    () => ({
      session: effectiveSession,
      isPending: isSessionPending,
      isAuthenticated: !!effectiveSession,
      signIn,
      signOut,
      getSpotifyAccessToken,
    }),
    [getSpotifyAccessToken, isSessionPending, effectiveSession],
  );

  const capabilities = useMemo(
    () => ({
      spotifyConnection,
      canControlPlayback,
    }),
    [canControlPlayback, spotifyConnection],
  );

  return { auth, capabilities };
}

export function AppRuntimeProvider({ children }: { children: ReactNode }) {
  const { auth, capabilities } = useRuntimeValues();

  return (
    <AppAuthContext.Provider value={auth}>
      <AppCapabilitiesContext.Provider value={capabilities}>
        {children}
      </AppCapabilitiesContext.Provider>
    </AppAuthContext.Provider>
  );
}

export function useAppAuth() {
  const context = useContext(AppAuthContext);
  if (!context) {
    throw new Error("useAppAuth must be used within an AppRuntimeProvider.");
  }

  return context;
}

export function useAppCapabilities() {
  const context = useContext(AppCapabilitiesContext);
  if (!context) {
    throw new Error(
      "useAppCapabilities must be used within an AppRuntimeProvider.",
    );
  }

  return context;
}
