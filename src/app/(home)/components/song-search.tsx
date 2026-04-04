"use client";

import { SpotifyTrack } from "@/types";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ChallengeButton } from "@/components/challenge-button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TrackCard } from "./track-card";

export function SongSearch({
  onSelect,
}: {
  onSelect: (track: SpotifyTrack, hardcore: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song to lock in..."
          className="h-12 pl-10.5 text-lg! w-full"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-mist-500 border-t-white" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              action={
                <div className="flex items-center gap-2">
                  <ChallengeButton
                    trackId={track.id}
                    trackName={track.name}
                    trackArtist={track.artist}
                  />
                  <button
                    onClick={() => onSelect(track, false)}
                    className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-red-500 transition"
                  >
                    Lock In
                  </button>
                  <button
                    onClick={() => onSelect(track, true)}
                    className="shrink-0 rounded-lg bg-white/5 border border-red-500/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition"
                    title="Any weakness breaks your streak"
                  >
                    Hardcore
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
