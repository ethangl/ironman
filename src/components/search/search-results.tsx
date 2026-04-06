"use client";

import { useWebPlayer } from "@/hooks/use-web-player";
import { useSearch } from "./search-provider";
import { TrackCard } from "./track-card";

export function SearchResults() {
  const { results } = useSearch();
  const { playTrack } = useWebPlayer();

  if (results.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {results.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          action={
            <button
              onClick={() => playTrack(track)}
              className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-red-500 transition"
            >
              Play
            </button>
          }
        />
      ))}
    </div>
  );
}
