import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { SpotifyArtist } from "@/features/spotify-client/types";
import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";

const FAVORITE_ARTISTS_LIMIT = 50;

interface SpotifyFavoriteArtistsContextValue {
  favoriteArtists: SpotifyArtist[];
  favoriteArtistsLoading: boolean;
  loadFavoriteArtists: (forceRefresh?: boolean) => Promise<void>;
}

export const SpotifyFavoriteArtistsContext =
  createContext<SpotifyFavoriteArtistsContextValue | null>(null);

export function useSpotifyFavoriteArtistsState(): SpotifyFavoriteArtistsContextValue {
  const [favoriteArtists, setFavoriteArtists] = useState<SpotifyArtist[]>([]);
  const [favoriteArtistsLoading, setFavoriteArtistsLoading] = useState(false);

  const loadFavoriteArtists = useCallback(
    async (forceRefresh = false) => {
      setFavoriteArtistsLoading(true);

      try {
        const client = await getAuthenticatedSpotifyConvexClient();
        const nextFavoriteArtists = await client.action(
          api.spotify.favoriteArtists,
          {
            limit: FAVORITE_ARTISTS_LIMIT,
            forceRefresh,
          },
        );
        setFavoriteArtists(nextFavoriteArtists);
      } finally {
        setFavoriteArtistsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadFavoriteArtists();
  }, [loadFavoriteArtists]);

  return useMemo(
    () => ({
      favoriteArtists,
      favoriteArtistsLoading,
      loadFavoriteArtists,
    }),
    [favoriteArtists, favoriteArtistsLoading, loadFavoriteArtists],
  );
}

export function useSpotifyFavoriteArtists() {
  const ctx = useContext(SpotifyFavoriteArtistsContext);
  if (!ctx) {
    throw new Error(
      "useSpotifyFavoriteArtists must be used within SpotifyActivityProvider",
    );
  }

  return ctx;
}
