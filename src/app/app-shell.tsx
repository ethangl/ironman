import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { useMemo } from "react";
import { Outlet } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { defaultSpotifyClient } from "@/features/spotify/client";
import { WebPlayerProvider } from "@/features/spotify/player";
import { convexAuthClient as authClient } from "@/lib/convex-auth-client";
import { getConvexUrl } from "@/lib/convex-env";
import { getConvexReactClient } from "./convex-react-client";
import { AppRuntimeProvider } from "./app-runtime";
import { Navbar } from "./navbar";

export function AppShell() {
  const convexUrl = getConvexUrl("the Vite app shell");

  const convexClient = useMemo(
    () => getConvexReactClient(convexUrl),
    [convexUrl],
  );

  return (
    <ConvexBetterAuthProvider client={convexClient} authClient={authClient}>
      <AppRuntimeProvider spotifyClient={defaultSpotifyClient}>
        <WebPlayerProvider>
          <Navbar />
          <Outlet />
          <Toaster />
        </WebPlayerProvider>
      </AppRuntimeProvider>
    </ConvexBetterAuthProvider>
  );
}
