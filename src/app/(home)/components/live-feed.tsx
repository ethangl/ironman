"use client";

import { List, ListItem } from "@/components/list";
import { useEffect, useState } from "react";

interface FeedItem {
  id: string;
  type: string;
  detail: string | null;
  trackName: string;
  trackArtist: string;
  userName: string | null;
  userImage: string | null;
  createdAt: string;
}

const typeConfig: Record<string, { icon: string; verb: string }> = {
  lock_in: { icon: "🔒", verb: "locked in" },
  surrender: { icon: "🏳️", verb: "surrendered to" },
  milestone: { icon: "🏆", verb: "hit a milestone on" },
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = () => {
      fetch("/api/feed")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <List title="Live Feed" loading={loading} count={items.length}>
      {items.map((item) => {
        const config = typeConfig[item.type] ?? {
          icon: "📌",
          verb: "did something on",
        };
        return (
          <ListItem key={item.id}>
            <span className="text-lg shrink-0 mt-0.5">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium text-foreground">
                  {item.userName ?? "Anonymous"}
                </span>{" "}
                <span className="text-muted-foreground">{config.verb}</span>{" "}
                <span className="text-foreground">{item.trackName}</span>
              </p>
              {item.detail && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.detail}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {timeAgo(item.createdAt)}
            </span>
          </ListItem>
        );
      })}
    </List>
  );
}
