"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500 py-4">
        Not enough data yet — need at least 3 attempts per song.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Pure Bangers</h2>
      <div className="space-y-2">
        {songs.map((song, i) => (
          <Link
            key={song.trackId}
            href={`/song/${song.trackId}`}
            className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition"
          >
            <span className="w-6 text-center text-sm font-bold text-zinc-500">
              {i + 1}
            </span>
            {song.trackImage ? (
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
              <p className="truncate text-xs text-zinc-400">{song.trackArtist}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-bold tabular-nums text-emerald-400">
                {song.avgCount}
              </span>
              <p className="text-[10px] text-zinc-500">avg plays</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
