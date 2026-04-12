import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useSpotifyClient } from "@/features/spotify/client";
import { useDebounce } from "@/hooks/use-debounce";
import { SpotifySearchResults } from "@/types";

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
  const client = useSpotifyClient();
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
    let cancelled = false;

    client.search.searchResults(trimmed, controller.signal)
      .then((data) => {
        if (cancelled || controller.signal.aborted) return;
        setError(null);
        cacheRef.current.set(trimmed, data);
        setResults({ query: trimmed, data });
      })
      .catch((error) => {
        if (cancelled || controller.signal.aborted) return;
        if (error.name !== "AbortError") {
          setResults({ query: trimmed, data: EMPTY_RESULTS });
          setError(
            error instanceof Error
              ? error.message
              : "Could not search Spotify.",
          );
          console.error("[search] request failed:", error);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [client, debouncedQuery]);

  const trimmed = query.trim();
  const loading = trimmed !== "" && results.query !== trimmed;
  const displayResults = trimmed ? results.data : EMPTY_RESULTS;
  const displayError = trimmed ? error : null;

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results: displayResults,
        loading,
        error: displayError,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
