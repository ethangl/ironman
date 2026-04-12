import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { useMemo } from "react";
import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/navbar";
import { WebPlayerProvider } from "@/components/player/web-player-provider";
import { Toaster } from "@/components/ui/sonner";
import { defaultAppDataClient } from "@/data/client";
import { convexAuthClient as authClient } from "@/lib/convex-auth-client";
import { getConvexUrl } from "@/lib/convex-env";
import { getConvexReactClient } from "@/lib/convex-react";
import { AppRuntimeProvider } from "@/runtime/app-runtime";

export function AppShell() {
  const convexUrl = getConvexUrl("the Vite app shell");

  const convexClient = useMemo(
    () => getConvexReactClient(convexUrl),
    [convexUrl],
  );

  return (
    <ConvexBetterAuthProvider client={convexClient} authClient={authClient}>
      <AppRuntimeProvider dataClient={defaultAppDataClient}>
        <WebPlayerProvider>
          <Navbar />
          <Outlet />
          <Toaster />
        </WebPlayerProvider>
      </AppRuntimeProvider>
    </ConvexBetterAuthProvider>
  );
}
