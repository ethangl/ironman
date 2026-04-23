import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoginButton } from "@/features/auth";
import { RoomsProvider } from "@/features/rooms";
import { WebPlayerProvider } from "@/features/spotify-player";

import { SearchProvider } from "@/features/spotify-search/search-provider";
import { SpotifySearch } from "@/features/spotify-search/spotify-search";
import { SpotifyActivityProvider } from "@/features/spotify-shell";
import { useAppAuth, useAppCapabilities } from "./app-runtime";
import { AuthPendingState } from "./auth-pending-state";

export function useAuthenticatedSession() {
  const { session } = useAppAuth();

  if (!session) {
    throw new Error(
      "useAuthenticatedSession must be used within RequireAuthenticatedSession.",
    );
  }

  return session;
}

export function RequireAuthenticatedSession() {
  const location = useLocation();
  const { isPending, session } = useAppAuth();
  const { spotifyConnection } = useAppCapabilities();

  if (isPending) {
    return (
      <AuthPendingState
        title="Loading your app session"
        description="We’re checking whether your Spotify session is ready before we open the signed-in app."
      />
    );
  }

  if (!session) {
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

  const canBrowsePersonalSpotify = spotifyConnection === "connected";
  const isCheckingSpotifyConnection = spotifyConnection === "unknown";

  if (!canBrowsePersonalSpotify) {
    return (
      <header className="backdrop-blur-lg backdrop-brightness-25 bottom-auto fixed flex inset-0 items-center h-16 justify-between px-4 top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="hidden max-w-xs text-right md:block">
            <p className="text-xs font-semibold text-foreground">
              {isCheckingSpotifyConnection
                ? "Checking your Spotify connection"
                : "Reconnect Spotify to restore personal features"}
            </p>
            <p className="text-[11px] leading-4 text-muted-foreground">
              {isCheckingSpotifyConnection
                ? "Your app session is active. We’re confirming Spotify access before we turn on personal activity and playback controls."
                : "Your app session is still active, but Spotify access is unavailable right now. Reconnecting should bring back recent plays, playlists, and playback controls."}
            </p>
          </div>
          {!isCheckingSpotifyConnection ? <LoginButton /> : null}
        </div>
      </header>
    );
  }

  return (
    <SpotifyActivityProvider>
      <WebPlayerProvider>
        <RoomsProvider>
          <SearchProvider>
            <Outlet />
            <SpotifySearch />
          </SearchProvider>
        </RoomsProvider>
      </WebPlayerProvider>
    </SpotifyActivityProvider>
  );
}
