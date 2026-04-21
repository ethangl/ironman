import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import type { SpotifySearchResults } from "@/features/spotify-client/types";

const EMPTY_RESULTS: SpotifySearchResults = {
  tracks: [],
  artists: [],
  playlists: [],
};

type SearchState = {
  error: string | null;
  loading: boolean;
  results: SpotifySearchResults;
};

const IDLE_SEARCH_STATE: SearchState = {
  error: null,
  loading: false,
  results: EMPTY_RESULTS,
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
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState(IDLE_SEARCH_STATE);
  const debouncedQuery = useDebounce(query, 300);
  const lastLocationKeyRef = useRef(location.key);
  const trimmedQuery = query.trim();
  const canSearch =
    trimmedQuery !== "" && debouncedQuery.trim() === trimmedQuery;

  useEffect(() => {
    if (lastLocationKeyRef.current === location.key) {
      return;
    }

    lastLocationKeyRef.current = location.key;
    window.scrollTo(0, 0);
    setQuery("");
    setSearchState(IDLE_SEARCH_STATE);
  }, [location.key]);

  useEffect(() => {
    if (!canSearch) {
      setSearchState(IDLE_SEARCH_STATE);
      return;
    }

    let cancelled = false;

    setSearchState({
      error: null,
      loading: true,
      results: EMPTY_RESULTS,
    });

    void getAuthenticatedSpotifyConvexClient()
      .then((client) =>
        client.action(api.spotify.search, {
          query: trimmedQuery,
        }),
      )
      .then((nextResults) => {
        if (cancelled) {
          return;
        }

        setSearchState({
          error: null,
          loading: false,
          results: nextResults,
        });
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }

        setSearchState({
          error:
            nextError instanceof Error
              ? nextError.message
              : "Could not search Spotify right now.",
          loading: false,
          results: EMPTY_RESULTS,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [canSearch, trimmedQuery]);

  const value = useMemo(
    () => ({
      error: canSearch ? searchState.error : null,
      loading: canSearch ? searchState.loading : false,
      query,
      results: canSearch ? searchState.results : EMPTY_RESULTS,
      setQuery,
    }),
    [canSearch, query, searchState],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
