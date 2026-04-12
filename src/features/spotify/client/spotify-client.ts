import { spotifyArtistsClient, type ArtistsClient } from "./artists-client";
import { spotifySearchClient, type SearchClient } from "./search-client";
import {
  spotifyActivityClient,
  type SpotifyActivityClient,
} from "./spotify-activity-client";

export interface SpotifyClient {
  artists: ArtistsClient;
  search: SearchClient;
  spotifyActivity: SpotifyActivityClient;
}

const baseSpotifyClient: SpotifyClient = {
  artists: spotifyArtistsClient,
  search: spotifySearchClient,
  spotifyActivity: spotifyActivityClient,
};

export function createSpotifyClient(
  overrides: Partial<SpotifyClient> = {},
): SpotifyClient {
  return {
    ...baseSpotifyClient,
    ...overrides,
  };
}

export const defaultSpotifyClient: SpotifyClient = createSpotifyClient();
