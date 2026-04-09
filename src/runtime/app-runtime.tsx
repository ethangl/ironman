import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AppDataClient,
  AppDataClientProvider,
  httpAppDataClient,
  useAppDataClient,
} from "@/data/client";
import { authClient, signIn, signOut, useSession } from "@/lib/auth-client";

type SessionState = ReturnType<typeof useSession>;
type SessionData = SessionState["data"];

export interface AppAuthRuntime {
  session: SessionData;
  isPending: boolean;
  isAuthenticated: boolean;
  signIn: typeof signIn;
  signOut: typeof signOut;
  getSpotifyAccessToken: () => Promise<string | null>;
}

export interface SpotifyStatus {
  code: "signed_out" | "checking" | "connected" | "reconnect_required";
  title: string;
  description: string;
  actionLabel: string | null;
}

export interface AppCapabilities {
  hasSession: boolean;
  spotifyConnection: "unknown" | "connected" | "disconnected";
  spotifyStatus: SpotifyStatus;
  canBrowsePersonalSpotify: boolean;
  canControlPlayback: boolean;
  canUseIronman: boolean;
}

export interface AppRuntime {
  auth: AppAuthRuntime;
  capabilities: AppCapabilities;
  dataClient: AppDataClient;
}

const AppRuntimeContext = createContext<AppRuntime | null>(null);

function getSpotifyStatus({
  isPending,
  session,
  spotifyConnection,
}: {
  isPending: boolean;
  session: SessionData;
  spotifyConnection: "unknown" | "connected" | "disconnected";
}): SpotifyStatus {
  if (isPending) {
    return {
      code: "checking",
      title: "Checking your Spotify session",
      description:
        "We’re figuring out whether your Spotify account is ready before we load your personal listening data.",
      actionLabel: null,
    };
  }

  if (!session) {
    return {
      code: "signed_out",
      title: "Sign in with Spotify to unlock your listening view",
      description:
        "Connect Spotify to see your recent tracks, playlists, favorite artists, and playback controls.",
      actionLabel: "Sign in with Spotify",
    };
  }

  if (spotifyConnection === "unknown") {
    return {
      code: "checking",
      title: "Checking your Spotify connection",
      description:
        "Your app session is active. We’re confirming Spotify access before we turn on personal activity and playback controls.",
      actionLabel: null,
    };
  }

  if (spotifyConnection === "connected") {
    return {
      code: "connected",
      title: "Spotify connected",
      description: "Your Spotify account is connected and ready.",
      actionLabel: null,
    };
  }

  return {
    code: "reconnect_required",
    title: "Reconnect Spotify to restore personal features",
    description:
      "Your app session is still active, but Spotify access is unavailable right now. Reconnecting should bring back recent plays, playlists, and playback controls.",
    actionLabel: "Reconnect Spotify",
  };
}

function useAuthRuntimeValue(dataClient: AppDataClient): AppRuntime {
  const { data: session, isPending } = useSession();
  const [spotifyConnection, setSpotifyConnection] = useState<
    "unknown" | "connected" | "disconnected"
  >(() => (session ? "unknown" : "disconnected"));

  const getSpotifyAccessToken = useCallback(async () => {
    const response = await authClient.getAccessToken({ providerId: "spotify" });
    const token = response.data?.accessToken ?? null;
    setSpotifyConnection(token ? "connected" : "disconnected");
    return token;
  }, []);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setSpotifyConnection("unknown");
    });

    void authClient
      .getAccessToken({ providerId: "spotify" })
      .then((response) => {
        if (cancelled) return;
        setSpotifyConnection(
          response.data?.accessToken ? "connected" : "disconnected",
        );
      })
      .catch(() => {
        if (cancelled) return;
        setSpotifyConnection("disconnected");
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const spotifyStatus = getSpotifyStatus({
    isPending,
    session,
    spotifyConnection: session ? spotifyConnection : "disconnected",
  });
  const isSpotifyReady = spotifyStatus.code === "connected";

  return useMemo(
    () => ({
      auth: {
        session,
        isPending,
        isAuthenticated: !!session,
        signIn,
        signOut,
        getSpotifyAccessToken,
      },
      capabilities: {
        hasSession: !!session,
        spotifyConnection: session ? spotifyConnection : "disconnected",
        spotifyStatus,
        canBrowsePersonalSpotify: isSpotifyReady,
        canControlPlayback: isSpotifyReady,
        canUseIronman: isSpotifyReady,
      },
      dataClient,
    }),
    [
      dataClient,
      getSpotifyAccessToken,
      isSpotifyReady,
      isPending,
      session,
      spotifyStatus,
      spotifyConnection,
    ],
  );
}

export function AppRuntimeProvider({
  children,
  dataClient = httpAppDataClient,
}: {
  children: ReactNode;
  dataClient?: AppDataClient;
}) {
  const value = useAuthRuntimeValue(dataClient);

  return (
    <AppRuntimeContext.Provider value={value}>
      <AppDataClientProvider client={dataClient}>{children}</AppDataClientProvider>
    </AppRuntimeContext.Provider>
  );
}

export function useAppRuntime() {
  const context = useContext(AppRuntimeContext);
  const dataClient = useAppDataClient();
  const fallback = useAuthRuntimeValue(dataClient);
  return context ?? fallback;
}

export function useAppAuth() {
  return useAppRuntime().auth;
}

export function useAppCapabilities() {
  return useAppRuntime().capabilities;
}
