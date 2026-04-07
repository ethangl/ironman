"use client";

import { useWebPlayer } from "@/hooks/use-web-player";
import { PlayButton } from "../player/play-button";
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
            <PlayButton pausable={false} onClick={() => playTrack(track)} />
          }
        />
      ))}
    </div>
  );
}
