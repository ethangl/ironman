import { createContext, type ReactNode, useContext } from "react";

import type { SpotifyClient } from "./spotify-client";

const SpotifyClientContext = createContext<SpotifyClient | null>(null);

export function SpotifyClientProvider({
  children,
  client,
}: {
  children: ReactNode;
  client: SpotifyClient;
}) {
  return (
    <SpotifyClientContext.Provider value={client}>
      {children}
    </SpotifyClientContext.Provider>
  );
}

export function useSpotifyClient() {
  const context = useContext(SpotifyClientContext);
  if (!context) {
    throw new Error(
      "useSpotifyClient must be used within a SpotifyClientProvider.",
    );
  }

  return context;
}
