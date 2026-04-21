import { createContext, type ReactNode, useContext, useMemo } from "react";
import {
  convexSignIn as signIn,
  convexSignOut as signOut,
  useConvexSession as useSession,
} from "@/lib/convex-auth-client";
import { getSpotifyStatus } from "./app-runtime-status";
import type { AppRuntime } from "./app-runtime-types";
import { useSettledSession } from "./use-settled-session";
import { useSpotifyRuntimeCapabilities } from "./use-spotify-runtime-capabilities";

export type {
  AppAuthRuntime,
  AppCapabilities,
  AppRuntime,
  SessionData,
  SpotifyStatus,
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
    canBrowsePersonalSpotify,
    canControlPlayback,
    getSpotifyAccessToken,
    spotifyConnection,
  } = useSpotifyRuntimeCapabilities(sessionUserId);

  const spotifyStatus = getSpotifyStatus({
    isPending: isSessionPending,
    session: effectiveSession,
    spotifyConnection: effectiveSession ? spotifyConnection : "disconnected",
  });

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
        hasSession: !!effectiveSession,
        spotifyConnection: effectiveSession
          ? spotifyConnection
          : "disconnected",
        spotifyStatus,
        canBrowsePersonalSpotify,
        canControlPlayback,
      },
    }),
    [
      canBrowsePersonalSpotify,
      canControlPlayback,
      effectiveSession,
      getSpotifyAccessToken,
      isSessionPending,
      spotifyStatus,
      spotifyConnection,
    ],
  );
}

export function AppRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useAuthRuntimeValue();

  return (
    <AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>
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
