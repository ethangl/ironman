import { useCallback, useEffect, useState } from "react";

import {
  BangerSong,
  HellscapeSong,
  IronmenEntry,
} from "@/data/leaderboards";
import { useAppDataClient } from "@/data/client";

function useBoardData<T>(loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loader]);

  return { items, loading };
}

export function useIronmenBoardData() {
  const client = useAppDataClient();
  const loader = useCallback(() => client.leaderboards.getIronmen(), [client]);
  return useBoardData<IronmenEntry>(loader);
}

export function useBangersBoardData() {
  const client = useAppDataClient();
  const loader = useCallback(() => client.leaderboards.getBangers(), [client]);
  return useBoardData<BangerSong>(loader);
}

export function useBrutalityBoardData() {
  const client = useAppDataClient();
  const loader = useCallback(
    () => client.leaderboards.getBrutality(),
    [client],
  );
  return useBoardData<HellscapeSong>(loader);
}
