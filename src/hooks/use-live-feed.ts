import { useEffect, useState } from "react";

import { useAppDataClient } from "@/data/client";
import { FeedItem } from "@/data/feed";

const LIVE_FEED_POLL_MS = 15_000;

export function useLiveFeed() {
  const client = useAppDataClient();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchFeed = () => {
      client.feed.getItems()
        .then((data) => {
          if (!cancelled) setItems(data);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    const fetchIfVisible = () => {
      if (document.visibilityState === "visible") {
        fetchFeed();
      }
    };

    fetchIfVisible();
    const interval = setInterval(fetchIfVisible, LIVE_FEED_POLL_MS);
    window.addEventListener("focus", fetchIfVisible);
    document.addEventListener("visibilitychange", fetchIfVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", fetchIfVisible);
      document.removeEventListener("visibilitychange", fetchIfVisible);
    };
  }, [client]);

  return { items, loading };
}
