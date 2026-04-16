import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { useMemo } from "react";
import { Outlet } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { defaultSpotifyClient } from "@/features/spotify/client";
import { convexAuthClient as authClient } from "@/lib/convex-auth-client";
import { getConvexUrl } from "@/lib/convex-env";
import { FilmGrain, Shader, Swirl, WaveDistortion } from "shaders/react";
import { AppRuntimeProvider } from "./app-runtime";
import { getConvexReactClient } from "./convex-react-client";

export function AppShell() {
  const convexUrl = getConvexUrl("the Vite app shell");

  const convexClient = useMemo(
    () => getConvexReactClient(convexUrl),
    [convexUrl],
  );

  return (
    <ConvexBetterAuthProvider client={convexClient} authClient={authClient}>
      <AppRuntimeProvider spotifyClient={defaultSpotifyClient}>
        <Shader className="fixed inset-0 pointer-events-none size-full -z-2">
          <Swirl
            id="idmnzddzegqivfwby28"
            blendMode="normal-oklch"
            colorA="oklch(14.8% 0.004 228.8)"
            colorB="oklch(21.8% 0.008 223.9)"
            colorSpace="oklch"
            speed={0.25}
          />
          <WaveDistortion
            angle={30}
            blendMode="normal-oklch"
            frequency={10}
            maskSource="idmnzddzegqivfwby28"
            speed={0.5}
            strength={0.2}
            visible={true}
            waveType="bounce"
          />
          <FilmGrain strength={0.02} />
        </Shader>
        <Outlet />
        <Toaster />
      </AppRuntimeProvider>
    </ConvexBetterAuthProvider>
  );
}
