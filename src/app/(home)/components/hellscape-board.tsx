"use client";

import { useEffect, useState } from "react";

import { List, ListLink } from "@/components/list";
import { difficultyLabel } from "@/lib/difficulty";

interface HellscapeSong {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  difficulty: number;
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export function HellscapeBoard() {
  const [songs, setSongs] = useState<HellscapeSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard/hellscape")
      .then((r) => r.json())
      .then(setSongs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (songs.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        Not enough data yet — need at least 3 attempts per song.
      </p>
    );
  }

  return (
    <List title="Legacies of Brutality" loading={loading} count={songs.length}>
      {songs.map((song, i) => {
        const dl = difficultyLabel(song.difficulty);
        return (
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
              <span className={`text-sm font-bold ${dl.color}`}>
                {song.difficulty.toFixed(1)}
              </span>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${dl.color}`}
              >
                {dl.label}
              </p>
            </div>
          </ListLink>
        );
      })}
    </List>
  );
}
