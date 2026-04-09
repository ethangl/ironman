import type { SpotifyArtistPageData } from "@/data/artists";
import { authClient } from "@/lib/auth-client";
import { getArtistPageData, SpotifyApiError } from "@/lib/spotify";

export interface ArtistsClient {
  getPageData: (artistId: string) => Promise<SpotifyArtistPageData | null>;
}

async function getSpotifyClientAccessToken() {
  const response = await authClient.getAccessToken({ providerId: "spotify" });
  return response.data?.accessToken ?? null;
}

export function createSpotifyArtistsClient(): ArtistsClient {
  return {
    getPageData: async (artistId) => {
      const token = await getSpotifyClientAccessToken();
      if (!token) {
        throw new Error(
          "Reconnect Spotify to load artist details.",
        );
      }

      try {
        return await getArtistPageData(token, artistId);
      } catch (error) {
        if (error instanceof SpotifyApiError && error.status === 404) {
          return null;
        }

        throw new Error("Could not load artist details right now.");
      }
    },
  };
}

export const spotifyArtistsClient = createSpotifyArtistsClient();
