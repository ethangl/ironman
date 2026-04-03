"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SpotifyTrack } from "@/types";
import { TrackCard } from "./track-card";

export function SongSearch({
  onSelect,
}: {
  onSelect: (track: SpotifyTrack) => void;
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
    <div className="w-full max-w-xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song to lock in..."
          className="w-full rounded-xl bg-white/5 border border-white/10 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
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
                <button
                  onClick={() => onSelect(track)}
                  className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500 transition"
                >
                  Lock In
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
