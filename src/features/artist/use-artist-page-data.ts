import { useCallback, useEffect, useRef, useState } from "react";

import { spotifyArtistsClient } from "@/features/spotify/client";
import { SpotifyArtistPageData } from "@/types";

export function useArtistPageData(artistId: string) {
  const [data, setData] = useState<SpotifyArtistPageData | null>(null);
  const [loading, setLoading] = useState(Boolean(artistId));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const load = useCallback(
    async (mode: "load" | "refresh") => {
      if (!artistId) {
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      setError(null);
      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setData(null);
        setLoading(true);
        setRefreshing(false);
      }

      try {
        const nextData = await spotifyArtistsClient.getPageData(artistId);
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
        setData(nextData ?? null);
      } catch (nextError) {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
        setData(null);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not load artist right now.",
        );
      }

      if (requestVersionRef.current !== requestVersion) {
        return;
      }
      setLoading(false);
      setRefreshing(false);
    },
    [artistId],
  );

  useEffect(() => {
    requestVersionRef.current += 1;

    if (!artistId) {
      setData(null);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    void load("load");
  }, [artistId, load]);

  const refresh = useCallback(async () => {
    await load("refresh");
  }, [load]);

  if (!artistId) {
    return {
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      notFound: true,
      refresh,
    };
  }

  return {
    data: data ?? null,
    loading,
    refreshing,
    error,
    notFound: !loading && !refreshing && !error && data === null,
    refresh,
  };
}
