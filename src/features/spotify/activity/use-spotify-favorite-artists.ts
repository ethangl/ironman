import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { spotifyActivityClient } from "@/features/spotify/client";
import type { SpotifyArtist } from "@/types";

const FAVORITE_ARTISTS_LIMIT = 50;

interface SpotifyFavoriteArtistsContextValue {
  favoriteArtists: SpotifyArtist[];
  favoriteArtistsLoading: boolean;
  loadFavoriteArtists: (forceRefresh?: boolean) => Promise<void>;
}

export const SpotifyFavoriteArtistsContext =
  createContext<SpotifyFavoriteArtistsContextValue | null>(null);

export function useSpotifyFavoriteArtistsState({
  canBrowsePersonalSpotify,
}: {
  canBrowsePersonalSpotify: boolean;
}): SpotifyFavoriteArtistsContextValue {
  const [favoriteArtists, setFavoriteArtists] = useState<SpotifyArtist[]>([]);
  const [favoriteArtistsLoading, setFavoriteArtistsLoading] = useState(false);

  const loadFavoriteArtists = useCallback(
    async (forceRefresh = false) => {
      if (!canBrowsePersonalSpotify) {
        return;
      }

      setFavoriteArtistsLoading(true);

      try {
        const nextFavoriteArtists = forceRefresh
          ? await spotifyActivityClient.getFavoriteArtists(
              FAVORITE_ARTISTS_LIMIT,
              true,
            )
          : await spotifyActivityClient.getFavoriteArtists(
              FAVORITE_ARTISTS_LIMIT,
            );
        setFavoriteArtists(nextFavoriteArtists);
      } finally {
        setFavoriteArtistsLoading(false);
      }
    },
    [canBrowsePersonalSpotify],
  );

  useEffect(() => {
    if (!canBrowsePersonalSpotify) {
      setFavoriteArtists([]);
      setFavoriteArtistsLoading(false);
      return;
    }

    void loadFavoriteArtists();
  }, [canBrowsePersonalSpotify, loadFavoriteArtists]);

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
