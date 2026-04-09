"use client";

import { useEffect, useState } from "react";

import { List, ListItem } from "@/components/list";
import { TrackCell } from "@/components/track-cell";
import { TrackInfo } from "@/types";

interface BangerSong extends TrackInfo {
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
        <ListItem key={song.trackId}>
          <TrackCell track={song} count={i + 1} />
          {/* <div className="flex-none text-right">
              <span className="text-xl font-bold tabular-nums text-emerald-400">
                {song.avgCount}
              </span>
              <p className="text-[10px] text-muted-foreground">avg plays</p>
            </div> */}
        </ListItem>
      ))}
    </List>
  );
}
