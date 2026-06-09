import {
  convexSignIn as signIn,
  convexSignOut as signOut,
  useConvexSession,
} from "@/lib/convex-auth-client";
import { useSpotifyRuntimeCapabilities } from "@/features/spotify-client/use-spotify-runtime-capabilities";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SessionState = ReturnType<typeof useConvexSession>;
export type SessionData = SessionState["data"];
export type SpotifyConnection = "unknown" | "connected" | "disconnected";

const SESSION_SETTLE_DELAY_MS = 400;

export interface AppAuthRuntime {
  session: SessionData;
  isPending: boolean;
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

function useSettledSession() {
  const { data: session, isPending } = useConvexSession();
  const [lastResolvedSession, setLastResolvedSession] =
    useState<SessionData>(session);
  const [isSessionSettled, setIsSessionSettled] = useState(() => !!session);

  useEffect(() => {
    if (session) {
      setIsSessionSettled(true);
      setLastResolvedSession(session);
      return;
    }

    if (isPending) {
      setIsSessionSettled(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setLastResolvedSession(null);
      setIsSessionSettled(true);
    }, SESSION_SETTLE_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isPending, session]);

  return {
    effectiveSession: session ?? (!isSessionSettled ? lastResolvedSession : null),
    isSessionPending: isPending || !isSessionSettled,
  };
}

function useRuntimeValues() {
  const { effectiveSession, isSessionPending } = useSettledSession();

  // Guest-default: once the session has settled to "none", silently create an
  // anonymous session so everyone is in without a login wall. Ref-guarded to
  // fire once; reset on failure so a later mount can retry.
  const anonymousAttempted = useRef(false);
  useEffect(() => {
    if (isSessionPending || effectiveSession) return;
    if (anonymousAttempted.current) return;
    anonymousAttempted.current = true;
    void signIn.anonymous().catch(() => {
      anonymousAttempted.current = false;
    });
  }, [isSessionPending, effectiveSession]);

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
