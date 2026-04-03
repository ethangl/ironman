"use client";

import { useEffect, useState } from "react";

interface Fellow {
  id: string;
  count: number;
  startedAt: string;
  userName: string | null;
  userImage: string | null;
}

export function FellowIronmen({ trackId }: { trackId: string }) {
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ironman/fellows?trackId=${trackId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFellows(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trackId]);

  if (loading || fellows.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">
        Fellow Ironmen — Live Now
      </h3>
      <div className="space-y-2">
        {fellows.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
          >
            {f.userImage ? (
              <img src={f.userImage} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-sm">
                  {f.userName ?? "Anonymous"}
                </span>
                <span className="shrink-0 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-red-400">LIVE</span>
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-bold tabular-nums">{f.count}</span>
              <span className="ml-1 text-xs text-zinc-500">plays</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
