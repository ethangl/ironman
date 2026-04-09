import { createContext, ReactNode, useContext } from "react";

import {
  type ArtistsClient,
  spotifyArtistsClient,
} from "@/data/artists-client";
import {
  convexIronmanClient,
  type IronmanClient,
} from "@/data/ironman-client";
import {
  convexLeaderboardsClient,
  type LeaderboardsClient,
} from "@/data/leaderboards-client";
import {
  convexPaletteClient,
  type PaletteClient,
} from "@/data/palette-client";
import {
  convexProfileClient,
  type ProfileClient,
} from "@/data/profile-client";
import { spotifySearchClient, type SearchClient } from "@/data/search-client";
import { convexSongsClient, type SongsClient } from "@/data/songs-client";
import {
  spotifyActivityClient,
  type SpotifyActivityClient,
} from "@/data/spotify-activity-client";

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
