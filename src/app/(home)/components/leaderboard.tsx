"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { List, ListItem } from "@/components/list";
import { getCurrentMilestone } from "@/lib/milestones";

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
  weaknessCount?: number;
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
  const count =
    entry.isMe && liveCount !== undefined
      ? Math.max(liveCount, entry.count)
      : entry.count;
  const isNewRecord =
    entry.isMe && liveCount !== undefined && liveCount > entry.count;

  return (
    <ListItem
      className={
        entry.isMe
          ? "bg-red-500/10 border border-red-500/20"
          : entry.rank === 1
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

      {entry.userImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.userImage} alt="" className="h-8 w-8 rounded-full" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-white/10" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {entry.userId && !entry.isMe ? (
            <Link
              href={`/profile/${entry.userId}`}
              className="truncate font-medium text-sm hover:text-red-400 transition"
            >
              {entry.userName ?? "Anonymous"}
            </Link>
          ) : (
            <span className="truncate font-medium text-sm">
              {entry.isMe ? "You" : (entry.userName ?? "Anonymous")}
            </span>
          )}
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
        {entry.weaknessCount != null && entry.weaknessCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {entry.weaknessCount}{" "}
            {entry.weaknessCount === 1 ? "weakness" : "weaknesses"}
          </span>
        )}
        {showTrack && entry.trackId && (
          <Link
            href={`/song/${entry.trackId}`}
            className="truncate text-xs text-muted-foreground hover:text-foreground transition"
          >
            {entry.trackName} - {entry.trackArtist}
          </Link>
        )}
        {showTrack && !entry.trackId && (
          <p className="truncate text-xs text-muted-foreground">
            {entry.trackName} - {entry.trackArtist}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        {(() => {
          const milestone = getCurrentMilestone(count);
          return milestone ? (
            <span className="text-sm mr-1" title={milestone.label}>
              {milestone.badge}
            </span>
          ) : null;
        })()}
        <span className="text-xl font-bold tabular-nums">{count}</span>
        <span className="ml-1 text-xs text-muted-foreground">plays</span>
        {isNewRecord && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 animate-pulse">
            New PB
          </p>
        )}
      </div>
    </ListItem>
  );
}

export function Leaderboard({
  trackId,
  liveCount,
}: {
  trackId?: string;
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

  return (
    <List title="Top Streaks" loading={loading} count={liveCount}>
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
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <div className="flex-1 border-t" />
            <span className="text-xs">...</span>
            <div className="flex-1 border-t" />
          </div>
          <EntryRow
            entry={myEntry}
            showTrack={!trackId}
            liveCount={liveCount}
          />
        </>
      )}
    </List>
  );
}
