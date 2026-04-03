"use client";

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
  lock_in: { icon: "🔒", verb: "locked in to" },
  surrender: { icon: "🏳️", verb: "surrendered on" },
  milestone: { icon: "🏆", verb: "hit a milestone on" },
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-500 text-sm">
        No activity yet. Be the first to lock in.
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Live Feed</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const config = typeConfig[item.type] ?? {
            icon: "📌",
            verb: "did something on",
          };
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl bg-white/5 p-3"
            >
              <span className="text-lg shrink-0 mt-0.5">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-white">
                    {item.userName ?? "Anonymous"}
                  </span>{" "}
                  <span className="text-zinc-400">{config.verb}</span>{" "}
                  <span className="text-white">{item.trackName}</span>
                </p>
                {item.detail && (
                  <p className="text-xs text-zinc-500 mt-0.5">{item.detail}</p>
                )}
              </div>
              <span className="text-xs text-zinc-600 shrink-0">
                {timeAgo(item.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
