import { authClient } from "@/lib/auth-client";
import { searchSpotify, searchTracks as searchTracksByName } from "@/lib/spotify";
import type { SpotifySearchResults, SpotifyTrack } from "@/types";

export interface SearchClient {
  searchResults: (
    query: string,
    signal?: AbortSignal,
  ) => Promise<SpotifySearchResults>;
  searchTracks: (query: string) => Promise<SpotifyTrack[]>;
}

function createAbortError() {
  const error = new Error("The search request was aborted.");
  error.name = "AbortError";
  return error;
}

async function getSpotifySearchAccessToken() {
  const accessToken = await authClient.getAccessToken({
    providerId: "spotify",
  });

  return accessToken?.data?.accessToken ?? null;
}

export function createSpotifySearchClient(): SearchClient {
  return {
    async searchResults(query, signal) {
      if (signal?.aborted) {
        throw createAbortError();
      }

      const token = await getSpotifySearchAccessToken();
      if (!token) {
        throw new Error("Reconnect Spotify to search.");
      }

      if (signal?.aborted) {
        throw createAbortError();
      }

      return searchSpotify(query, token);
    },
    async searchTracks(query) {
      const token = await getSpotifySearchAccessToken();
      if (!token) {
        throw new Error("Reconnect Spotify to search.");
      }

      return searchTracksByName(query, token);
    },
  };
}

export const spotifySearchClient = createSpotifySearchClient();
