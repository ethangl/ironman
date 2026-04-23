import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { Outlet } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { convexAuthClient as authClient } from "@/lib/convex-auth-client";
import { getConvexUrl } from "@/lib/convex-env";
import {
  FilmGrain,
  Shader,
  SimplexNoise,
  Swirl,
  WaveDistortion,
} from "shaders/react";
import { AppRuntimeProvider } from "./app-runtime";

let cachedConvexClient: ConvexReactClient | null = null;
let cachedConvexUrl: string | null = null;

function getOrCreateConvexReactClient(url: string) {
  if (!cachedConvexClient || cachedConvexUrl !== url) {
    cachedConvexClient = new ConvexReactClient(url);
    cachedConvexUrl = url;
  }

  return cachedConvexClient;
}

export function AppShell() {
  const convexUrl = getConvexUrl("the Vite app shell");
  const convexClient = getOrCreateConvexReactClient(convexUrl);

  return (
    <ConvexBetterAuthProvider client={convexClient} authClient={authClient}>
      <AppRuntimeProvider>
        <NuqsAdapter>
          <TooltipProvider>
            <Shader className="fixed inset-0 pointer-events-none size-full -z-2">
              <Swirl
                id="idmnzddzegqivfwby28"
                blendMode="normal-oklch"
                colorA="oklch(14.8% 0.004 228.8)"
                colorB="oklch(21.8% 0.008 223.9)"
                colorSpace="oklch"
                speed={0.2}
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
              <SimplexNoise
                scale={8.0}
                speed={0}
                blendMode="overlay"
                opacity={0.5}
              />
              <FilmGrain strength={0} />
            </Shader>
            <Outlet />
            <Toaster />
          </TooltipProvider>
        </NuqsAdapter>
      </AppRuntimeProvider>
    </ConvexBetterAuthProvider>
  );
}
