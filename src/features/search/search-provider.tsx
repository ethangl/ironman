import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifySearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const requestVersionRef = useRef(0);
  const lastLocationKeyRef = useRef(location.key);
  const trimmed = query.trim();
  const debouncedTrimmed = debouncedQuery.trim();

  useEffect(() => {
    if (lastLocationKeyRef.current === location.key) {
      return;
    }

    lastLocationKeyRef.current = location.key;
    window.scrollTo(0, 0);
    setQuery("");
    setResults(EMPTY_RESULTS);
    setLoading(false);
    setError(null);
  }, [location.key]);

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;

    if (!trimmed || trimmed !== debouncedTrimmed) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setError(null);
      return;
    }

    setResults(EMPTY_RESULTS);
    setLoading(true);
    setError(null);

    void client.search
      .searchResults(trimmed)
      .then((nextResults) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
        setResults(nextResults);
      })
      .catch((nextError) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not search Spotify right now.",
        );
      })
      .finally(() => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
        setLoading(false);
      });
  }, [client, debouncedTrimmed, trimmed]);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results: trimmed ? results : EMPTY_RESULTS,
        loading: trimmed !== "" && trimmed === debouncedTrimmed && loading,
        error: trimmed ? error : null,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
