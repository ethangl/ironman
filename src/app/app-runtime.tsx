import {
  convexSignIn as signIn,
  convexSignOut as signOut,
  useConvexSession as useSession,
} from "@/lib/convex-auth-client";
import { useSpotifyRuntimeCapabilities } from "@/features/spotify-client/use-spotify-runtime-capabilities";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { AppRuntime } from "./app-runtime-types";
import { useSettledSession } from "./use-settled-session";

export type {
  AppAuthRuntime,
  AppCapabilities,
  AppRuntime,
  SessionData,
} from "./app-runtime-types";

const AppRuntimeContext = createContext<AppRuntime | null>(null);

function useAuthRuntimeValue(): AppRuntime {
  const { data: session, isPending } = useSession();
  const { effectiveSession, isSessionPending } = useSettledSession({
    isPending,
    session,
  });
  const sessionUserId = effectiveSession?.user.id ?? null;
  const {
    canControlPlayback,
    getSpotifyAccessToken,
    spotifyConnection,
  } = useSpotifyRuntimeCapabilities(sessionUserId);

  return useMemo(
    () => ({
      auth: {
        session: effectiveSession,
        isPending: isSessionPending,
        isAuthenticated: !!effectiveSession,
        signIn,
        signOut,
        getSpotifyAccessToken,
      },
      capabilities: {
        spotifyConnection,
        canControlPlayback,
      },
    }),
    [
      canControlPlayback,
      getSpotifyAccessToken,
      isSessionPending,
      effectiveSession,
      spotifyConnection,
    ],
  );
}

export function AppRuntimeProvider({ children }: { children: ReactNode }) {
  const value = useAuthRuntimeValue();

  return (
    <AppRuntimeContext.Provider value={value}>
      {children}
    </AppRuntimeContext.Provider>
  );
}

export function useAppRuntime() {
  const context = useContext(AppRuntimeContext);
  if (!context) {
    throw new Error("useAppRuntime must be used within an AppRuntimeProvider.");
  }

  return context;
}

export function useAppAuth() {
  return useAppRuntime().auth;
}

export function useAppCapabilities() {
  return useAppRuntime().capabilities;
}
