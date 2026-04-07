"use client";

import { useEffect, useState } from "react";

import { List, ListItem } from "@/components/list";
import { PlayButton } from "@/components/player/play-button";
import { TrackCell } from "@/components/track-cell";
import { useWebPlayer } from "@/hooks/use-web-player";
import { toPlayable, TrackInfo } from "@/types";

interface BangerSong extends TrackInfo {
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export function BangersBoard() {
  const [songs, setSongs] = useState<BangerSong[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useWebPlayer();

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
        <ListItem key={song.trackId}>
          <span className="w-6 text-center text-sm font-bold text-muted-foreground">
            {i + 1}
          </span>
          <TrackCell track={song} />
          <div className="text-right shrink-0">
            <span className="text-xl font-bold tabular-nums text-emerald-400">
              {song.avgCount}
            </span>
            <p className="text-[10px] text-muted-foreground">avg plays</p>
          </div>
          <PlayButton
            pausable={false}
            onClick={() => playTrack(toPlayable(song))}
          />
        </ListItem>
      ))}
    </List>
  );
}
