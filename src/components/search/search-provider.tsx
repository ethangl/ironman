"use client";

import { SpotifyTrack } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  results: SpotifyTrack[];
  loading: boolean;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    query: string;
    tracks: SpotifyTrack[];
  }>({ query: "", tracks: [] });
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;

    let cancelled = false;

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setResults({ query: debouncedQuery, tracks: data });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const trimmed = query.trim();
  const loading = trimmed !== "" && results.query !== trimmed;
  const displayResults = trimmed ? results.tracks : [];

  return (
    <SearchContext.Provider
      value={{ query, setQuery, results: displayResults, loading }}
    >
      {children}
    </SearchContext.Provider>
  );
}
