import type { SpotifySearchResults, SpotifyTrack } from "@/types";
import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

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

export function createConvexSpotifySearchClient(): SearchClient {
  return {
    async searchResults(query, signal) {
      if (signal?.aborted) {
        throw createAbortError();
      }

      if (signal?.aborted) {
        throw createAbortError();
      }

      const client = await getAuthenticatedSpotifyConvexClient();

      if (signal?.aborted) {
        throw createAbortError();
      }

      return client.action(api.spotify.search, {
        query,
      });
    },
    async searchTracks(query) {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.searchTracks, {
        query,
      });
    },
  };
}

export const spotifySearchClient = createConvexSpotifySearchClient();
