"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentMilestone } from "@/lib/milestones";
import { difficultyLabel } from "@/lib/difficulty";

interface IronmenEntry {
  rank: number;
  id: string;
  userId: string;
  count: number;
  active: boolean;
  hardcore: boolean;
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  userName: string | null;
  userImage: string | null;
  streakScore: number;
  songDifficulty: number;
}

export function IronmenBoard() {
  const [entries, setEntries] = useState<IronmenEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard/ironmen")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500 py-4">
        No streaks yet — be the first.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Greatest Iron Men</h2>
      <div className="space-y-2">
        {entries.map((entry) => {
          const milestone = getCurrentMilestone(entry.count);
          const dl = difficultyLabel(entry.songDifficulty);
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                entry.rank === 1
                  ? "bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
                  : "bg-white/5"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                  entry.rank === 1
                    ? "bg-yellow-500 text-black"
                    : entry.rank === 2
                      ? "bg-zinc-300 text-black"
                      : entry.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-white/10 text-zinc-400"
                }`}
              >
                {entry.rank}
              </div>

              {entry.userImage ? (
                <img src={entry.userImage} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/10" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${entry.userId}`} className="truncate font-medium text-sm hover:text-red-400 transition">
                    {entry.userName ?? "Anonymous"}
                  </Link>
                  {entry.hardcore && (
                    <span className="shrink-0 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                      HC
                    </span>
                  )}
                  {entry.active && (
                    <span className="shrink-0 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] text-red-400">LIVE</span>
                    </span>
                  )}
                </div>
                <Link href={`/song/${entry.trackId}`} className="truncate text-xs text-zinc-500 hover:text-zinc-300 transition block">
                  {entry.trackName} — {entry.trackArtist}
                  <span className={`ml-1.5 ${dl.color}`}>{dl.label}</span>
                </Link>
              </div>

              <div className="text-right shrink-0">
                <div>
                  {milestone && (
                    <span className="text-sm mr-1" title={milestone.label}>{milestone.badge}</span>
                  )}
                  <span className="text-xl font-bold tabular-nums">{entry.count}</span>
                  <span className="ml-1 text-xs text-zinc-500">plays</span>
                </div>
                <div className="text-[10px] text-zinc-500 tabular-nums">
                  Score: {entry.streakScore}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
