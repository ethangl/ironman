import { api } from "@api";
import type { SpotifyArtistPageData } from "@/types";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

export interface ArtistsClient {
  getPageData: (artistId: string) => Promise<SpotifyArtistPageData | null>;
}

export function createConvexSpotifyArtistsClient(): ArtistsClient {
  return {
    getPageData: async (artistId) => {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.artistPage, {
        artistId,
      });
    },
  };
}

export const spotifyArtistsClient = createConvexSpotifyArtistsClient();
