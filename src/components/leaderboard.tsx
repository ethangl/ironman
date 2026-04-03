"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  userId?: string;
  count: number;
  active: boolean;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackId?: string;
  userName: string | null;
  userImage: string | null;
  startedAt: string;
  isMe?: boolean;
}

function EntryRow({
  entry,
  showTrack,
  liveCount,
}: {
  entry: LeaderboardEntry;
  showTrack: boolean;
  liveCount?: number;
}) {
  const count = entry.isMe && liveCount !== undefined ? liveCount : entry.count;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 ${
        entry.isMe
          ? "bg-red-500/10 border border-red-500/20"
          : entry.rank === 1
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
          <span className="truncate font-medium text-sm">
            {entry.isMe ? "You" : (entry.userName ?? "Anonymous")}
          </span>
          {entry.rank === 1 && (
            <span className="shrink-0 rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
              Iron Man
            </span>
          )}
          {entry.active && (
            <span className="shrink-0 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-400">LIVE</span>
            </span>
          )}
        </div>
        {showTrack && (
          <p className="truncate text-xs text-zinc-500">
            {entry.trackName} - {entry.trackArtist}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        <span className="text-xl font-bold tabular-nums">{count}</span>
        <span className="ml-1 text-xs text-zinc-500">plays</span>
      </div>
    </div>
  );
}

export function Leaderboard({
  trackId,
  title,
  liveCount,
}: {
  trackId?: string;
  title: string;
  liveCount?: number;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = trackId
      ? `/api/leaderboard/${trackId}`
      : "/api/leaderboard/global";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        // Track-specific endpoint returns { leaderboard, myEntry }
        // Global endpoint returns an array directly
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          setEntries(data.leaderboard ?? []);
          setMyEntry(data.myEntry ?? null);
        }
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [trackId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p className="text-lg">No streaks yet</p>
        <p className="text-sm mt-1">Be the first Iron Man</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            showTrack={!trackId}
            liveCount={entry.isMe ? liveCount : undefined}
          />
        ))}
        {myEntry && (
          <>
            <div className="flex items-center gap-2 py-1 text-zinc-600">
              <div className="flex-1 border-t border-zinc-800" />
              <span className="text-xs">...</span>
              <div className="flex-1 border-t border-zinc-800" />
            </div>
            <EntryRow
              entry={myEntry}
              showTrack={!trackId}
              liveCount={liveCount}
            />
          </>
        )}
      </div>
    </div>
  );
}
