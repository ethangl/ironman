"use client";

import { useEffect, useState } from "react";

import { List, ListItem } from "@/components/list";
import { PlayButton } from "@/components/player/play-button";
import { TrackCell } from "@/components/track-cell";
import { useWebPlayer } from "@/hooks/use-web-player";
import { difficultyLabel } from "@/lib/difficulty";
import { toPlayable, TrackInfo } from "@/types";

interface HellscapeSong extends TrackInfo {
  difficulty: number;
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export function BrutalityBoard() {
  const [songs, setSongs] = useState<HellscapeSong[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useWebPlayer();

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
          <ListItem key={song.trackId}>
            <span className="w-6 text-center text-sm font-bold text-muted-foreground">
              {i + 1}
            </span>
            <TrackCell track={song} />
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
            <PlayButton
              pausable={false}
              onClick={() => playTrack(toPlayable(song))}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
