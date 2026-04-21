import type { SpotifySearchResults } from "@/types";
import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

export interface SearchClient {
  searchResults: (
    query: string,
    signal?: AbortSignal,
  ) => Promise<SpotifySearchResults>;
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
  };
}

export const spotifySearchClient = createConvexSpotifySearchClient();
