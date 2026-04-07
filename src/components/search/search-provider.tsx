"use client";

import { SpotifyTrack } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  const cacheRef = useRef(new Map<string, SpotifyTrack[]>());

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return;

    const cached = cacheRef.current.get(trimmed);
    if (cached) {
      setResults({ query: trimmed, tracks: cached });
      return;
    }

    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        cacheRef.current.set(trimmed, data);
        setResults({ query: trimmed, tracks: data });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("[search] request failed:", error);
        }
      });

    return () => {
      controller.abort();
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
