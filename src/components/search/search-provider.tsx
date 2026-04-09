"use client";

import { SpotifySearchResults } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

const EMPTY_RESULTS: SpotifySearchResults = {
  tracks: [],
  artists: [],
  playlists: [],
};

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  results: SpotifySearchResults;
  loading: boolean;
  error: string | null;
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
    data: SpotifySearchResults;
  }>({ query: "", data: EMPTY_RESULTS });
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const cacheRef = useRef(new Map<string, SpotifySearchResults>());

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return;

    const cached = cacheRef.current.get(trimmed);
    if (cached) {
      queueMicrotask(() => {
        setError(null);
        setResults({ query: trimmed, data: cached });
      });
      return;
    }

    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const text = await r.text();
        const data = text ? (JSON.parse(text) as unknown) : null;
        if (!r.ok) {
          throw new Error(
            data &&
              typeof data === "object" &&
              "error" in data &&
              data.error &&
              typeof data.error === "object" &&
              "message" in data.error &&
              typeof data.error.message === "string"
              ? data.error.message
              : data &&
                  typeof data === "object" &&
                  "error" in data &&
                  typeof data.error === "string"
                ? data.error
                : "Search failed.",
          );
        }
        setError(null);
        return data as SpotifySearchResults;
      })
      .then((data) => {
        cacheRef.current.set(trimmed, data);
        setResults({ query: trimmed, data });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setResults({ query: trimmed, data: EMPTY_RESULTS });
          setError(
            error instanceof Error ? error.message : "Could not search Spotify.",
          );
          console.error("[search] request failed:", error);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const trimmed = query.trim();
  const loading = trimmed !== "" && results.query !== trimmed;
  const displayResults = trimmed ? results.data : EMPTY_RESULTS;
  const displayError = trimmed ? error : null;

  return (
    <SearchContext.Provider
      value={{ query, setQuery, results: displayResults, loading, error: displayError }}
    >
      {children}
    </SearchContext.Provider>
  );
}
