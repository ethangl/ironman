"use client";

import { useEffect, useState } from "react";

import { List, ListLink } from "@/components/list";

interface BangerSong {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export function BangersBoard() {
  const [songs, setSongs] = useState<BangerSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard/bangers")
      .then((r) => r.json())
      .then(setSongs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <List title="Pure Bangers" loading={loading} count={songs.length}>
      {songs.map((song, i) => (
        <ListLink key={song.trackId} href={`/song/${song.trackId}`}>
          <span className="w-6 text-center text-sm font-bold text-muted-foreground">
            {i + 1}
          </span>
          {song.trackImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={song.trackImage}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/10" />
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{song.trackName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {song.trackArtist}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl font-bold tabular-nums text-emerald-400">
              {song.avgCount}
            </span>
            <p className="text-[10px] text-muted-foreground">avg plays</p>
          </div>
        </ListLink>
      ))}
    </List>
  );
}
