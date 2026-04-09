import { createContext, ReactNode, useContext } from "react";

import { spotifyArtistsClient, type ArtistsClient } from "./artists-client";
import { convexIronmanClient, type IronmanClient } from "./ironman-client";
import {
  convexLeaderboardsClient,
  type LeaderboardsClient,
} from "./leaderboards-client";
import { convexPaletteClient, type PaletteClient } from "./palette-client";
import { convexProfileClient, type ProfileClient } from "./profile-client";
import { spotifySearchClient, type SearchClient } from "./search-client";
import { convexSongsClient, type SongsClient } from "./songs-client";
import {
  spotifyActivityClient,
  type SpotifyActivityClient,
} from "./spotify-activity-client";

export interface AppDataClient {
  profile: ProfileClient;
  songs: SongsClient;
  artists: ArtistsClient;
  ironman: IronmanClient;
  leaderboards: LeaderboardsClient;
  palette: PaletteClient;
  search: SearchClient;
  spotifyActivity: SpotifyActivityClient;
}

const baseAppDataClient: AppDataClient = {
  profile: convexProfileClient,
  songs: convexSongsClient,
  artists: spotifyArtistsClient,
  ironman: convexIronmanClient,
  leaderboards: convexLeaderboardsClient,
  palette: convexPaletteClient,
  search: spotifySearchClient,
  spotifyActivity: spotifyActivityClient,
};

export function createAppDataClient(
  overrides: Partial<AppDataClient> = {},
): AppDataClient {
  return {
    ...baseAppDataClient,
    ...overrides,
  };
}

export const defaultAppDataClient: AppDataClient = createAppDataClient();

const AppDataClientContext = createContext<AppDataClient | null>(null);

export function AppDataClientProvider({
  children,
  client,
}: {
  children: ReactNode;
  client: AppDataClient;
}) {
  return (
    <AppDataClientContext.Provider value={client}>
      {children}
    </AppDataClientContext.Provider>
  );
}

export function useAppDataClient() {
  const context = useContext(AppDataClientContext);
  if (!context) {
    throw new Error(
      "useAppDataClient must be used within an AppDataClientProvider.",
    );
  }

  return context;
}
