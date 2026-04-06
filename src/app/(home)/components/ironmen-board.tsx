"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/avatar";
import { List, ListItem } from "@/components/list";
import { difficultyLabel } from "@/lib/difficulty";
import { getCurrentMilestone } from "@/lib/milestones";

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

  return (
    <List title="True Iron Men" loading={loading} count={entries.length}>
      {entries.map((entry) => {
        const milestone = getCurrentMilestone(entry.count);
        const dl = difficultyLabel(entry.songDifficulty);
        return (
          <ListItem
            key={entry.id}
            className={
              entry.rank === 1
                ? "bg-linear-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
                : undefined
            }
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                entry.rank === 1
                  ? "bg-yellow-500 text-mist-950"
                  : entry.rank === 2
                    ? "bg-mist-300 text-mist-950"
                    : entry.rank === 3
                      ? "bg-amber-700 text-foreground"
                      : "bg-white/10 text-muted-foreground"
              }`}
            >
              {entry.rank}
            </div>

            <Avatar
              id={entry.userId}
              image={entry.userImage}
              name={entry.userName}
              sizeClassName="size-8 text-3xl"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${entry.userId}`}
                  className="truncate font-medium text-sm hover:text-red-400 transition"
                >
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
              <Link
                href={`/song/${entry.trackId}`}
                className="truncate text-xs text-muted-foreground hover:text-foreground transition block"
              >
                {entry.trackName} — {entry.trackArtist}
                <span className={`ml-1.5 ${dl.color}`}>{dl.label}</span>
              </Link>
            </div>

            <div className="text-right shrink-0">
              <div>
                {milestone && (
                  <span className="text-sm mr-1" title={milestone.label}>
                    {milestone.badge}
                  </span>
                )}
                <span className="text-xl font-bold tabular-nums">
                  {entry.count}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  plays
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                Score: {entry.streakScore}
              </div>
            </div>
          </ListItem>
        );
      })}
    </List>
  );
}
