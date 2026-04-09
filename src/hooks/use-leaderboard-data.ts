import { useEffect, useState } from "react";

import { useAppDataClient } from "@/data/client";
import { type LeaderboardEntry } from "@/data/leaderboards";

export function useLeaderboardData(trackId?: string) {
  const client = useAppDataClient();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    const request = trackId
      ? client.leaderboards.getTrack(trackId).then((data) => ({
          entries: data.leaderboard ?? [],
          myEntry: data.myEntry ?? null,
        }))
      : client.leaderboards.getGlobal().then((data) => ({
          entries: data,
          myEntry: null,
        }));

    request
      .then((data) => {
        if (cancelled) return;
        setEntries(data.entries);
        setMyEntry(data.myEntry);
      })
      .catch(() => {
        if (cancelled) return;
        setEntries([]);
        setMyEntry(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, trackId]);

  return { entries, myEntry, loading };
}
