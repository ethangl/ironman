import { useCallback, useEffect, useState } from "react";

import { useSpotifyClient } from "@/features/spotify/client";
import { SpotifyArtistPageData } from "@/types";

export function useArtistPageData(artistId: string) {
  const client = useSpotifyClient();
  const enabled = !!artistId;
  const [data, setData] = useState<SpotifyArtistPageData | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryFn = useCallback(
    () => client.artists.getPageData(artistId),
    [artistId, client],
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setRefreshing(data !== null);
    setLoading(data === null);

    try {
      const nextData = await queryFn();
      setData(nextData);
      setError(null);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not load artist details.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data, enabled, queryFn]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    void refresh();
  }, [enabled, refresh]);

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
