import { useEffect, useState } from "react";

import type { HomeLeaderboardsResponse } from "@shared/leaderboards";
import { useAppDataClient } from "@/data/client";

const EMPTY_HOME_LEADERBOARDS: HomeLeaderboardsResponse = {
  global: [],
  ironmen: [],
  bangers: [],
  hellscape: [],
};

export function useHomeLeaderboardsData() {
  const client = useAppDataClient();
  const [data, setData] = useState<HomeLeaderboardsResponse>(
    EMPTY_HOME_LEADERBOARDS,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    client.leaderboards
      .getHome()
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch(() => {
        if (!cancelled) setData(EMPTY_HOME_LEADERBOARDS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  return { data, loading };
}
