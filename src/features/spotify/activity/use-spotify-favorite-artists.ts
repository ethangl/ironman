import { useCallback, useEffect, useState } from "react";

import { spotifyActivityClient } from "@/features/spotify/client";
import type { SpotifyArtist } from "@/types";

const FAVORITE_ARTISTS_LIMIT = 50;

export function useSpotifyFavoriteArtists({
  canBrowsePersonalSpotify,
}: {
  canBrowsePersonalSpotify: boolean;
}) {
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

  return {
    favoriteArtists,
    favoriteArtistsLoading,
    loadFavoriteArtists,
  };
}
