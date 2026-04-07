"use client";

import { TrackCell } from "@/components/track-cell";
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
  const trackInfo = {
    trackId: track.id,
    trackName: track.name,
    trackArtist: track.artist,
    trackImage: track.albumImage,
    trackDuration: track.durationMs,
  };

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition">
      <TrackCell
        track={trackInfo}
        subtitle={
          track.topStreak && (
            <p className="text-xs text-yellow-400/80 mt-0.5">
              Iron Man: {track.topStreak.userName ?? "Anonymous"} —{" "}
              {track.topStreak.count} plays
            </p>
          )
        }
      />
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
