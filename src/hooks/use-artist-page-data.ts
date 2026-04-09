import { useEffect, useState } from "react";

import { useAppDataClient } from "@/data/client";
import { SpotifyArtistPageData } from "@/types";

export function useArtistPageData(artistId: string) {
  const client = useAppDataClient();
  const [data, setData] = useState<SpotifyArtistPageData | null>(null);
  const [loading, setLoading] = useState(() => !!artistId);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!artistId) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    client.artists.getPageData(artistId)
      .then((nextData) => {
        if (cancelled) return;
        setData(nextData);
        setError(null);
        setNotFound(!nextData);
      })
      .catch((nextError) => {
        if (cancelled) return;
        setData(null);
        setNotFound(false);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not load artist details.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [artistId, client]);

  if (!artistId) {
    return {
      data: null,
      loading: false,
      error: null,
      notFound: true,
    };
  }

  return { data, loading, error, notFound };
}
