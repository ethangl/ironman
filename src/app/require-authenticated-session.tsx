import { createContext, type ReactNode, useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { RoomsProvider } from "@/features/rooms";
import { SearchProvider } from "@/features/spotify-search";
import { SpotifyActivityProvider } from "@/features/spotify-shell";
import { WebPlayerProvider } from "@/features/spotify-player";
import { useAppAuth } from "./app-runtime";
import { AuthPendingState } from "./auth-pending-state";
import type { SessionData } from "./app-runtime";

type AuthenticatedSession = NonNullable<SessionData>;

const AuthenticatedSessionContext =
  createContext<AuthenticatedSession | null>(null);

export function AuthenticatedSessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: AuthenticatedSession;
}) {
  return (
    <AuthenticatedSessionContext.Provider value={session}>
      {children}
    </AuthenticatedSessionContext.Provider>
  );
}

export function useAuthenticatedSession() {
  const session = useContext(AuthenticatedSessionContext);

  if (!session) {
    throw new Error(
      "useAuthenticatedSession must be used within RequireAuthenticatedSession.",
    );
  }

  return session;
}

export function RequireAuthenticatedSession() {
  const { isAuthenticated, isPending, session } = useAppAuth();
  const location = useLocation();

  if (isPending) {
    return (
      <AuthPendingState
        title="Loading your app session"
        description="We’re checking whether your Spotify session is ready before we open the signed-in app."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={{
          pathname: "/",
          search: location.search,
        }}
        replace
      />
    );
  }

  if (!session) {
    throw new Error(
      "Authenticated app routes mounted without an active session.",
    );
  }

  return (
    <AuthenticatedSessionProvider session={session}>
      <SpotifyActivityProvider>
        <WebPlayerProvider>
          <RoomsProvider>
            <SearchProvider>
              <Outlet />
            </SearchProvider>
          </RoomsProvider>
        </WebPlayerProvider>
      </SpotifyActivityProvider>
    </AuthenticatedSessionProvider>
  );
}
