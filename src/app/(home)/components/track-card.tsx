"use client";

import { difficultyLabel } from "@/lib/difficulty";
import { SpotifyTrack } from "@/types";

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TrackCard({
  track,
  action,
}: {
  track: SpotifyTrack;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition">
      {track.albumImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.albumImage}
          alt=""
          className="h-14 w-14 rounded-lg object-cover"
        />
      ) : (
        <div className="h-14 w-14 rounded-lg bg-white/10" />
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{track.name}</p>
        <p className="truncate text-sm text-muted-foreground">{track.artist}</p>
        {track.topStreak && (
          <p className="text-xs text-yellow-400/80 mt-0.5">
            Iron Man: {track.topStreak.userName ?? "Anonymous"} —{" "}
            {track.topStreak.count} plays
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDuration(track.durationMs)}
        </span>
        {track.difficulty != null && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${difficultyLabel(track.difficulty).color}`}
          >
            {difficultyLabel(track.difficulty).label}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
