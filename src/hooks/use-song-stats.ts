import { useEffect, useState } from "react";

import { useAppDataClient } from "@/data/client";
import type { SongStats } from "@/lib/song-stats";

export function useSongStats(trackId: string) {
  const client = useAppDataClient();
  const [stats, setStats] = useState<SongStats | null>(null);
  const [loading, setLoading] = useState(() => !!trackId);

  useEffect(() => {
    if (!trackId) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setStats(null);
      setLoading(true);
    });

    client.songs.getStats(trackId)
      .then((nextStats) => {
        if (!cancelled) setStats(nextStats);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, trackId]);

  if (!trackId) {
    return { stats: null, loading: false };
  }

  return { stats, loading };
}
