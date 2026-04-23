import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

import { FAVORITE_ARTISTS_PAGE_SIZE } from "@/features/spotify-client";
import type {
  FavoriteArtistsPage,
  SpotifyArtist,
} from "@/features/spotify-client/types";
import { useStablePaginatedAction } from "@/hooks/use-stable-paginated-action";
import { useStableAction } from "@/hooks/use-stable-action";
import { getSpotifyFavoriteArtistsPage } from "./spotify-favorite-artists-client";

const FAVORITE_ARTISTS_KEY = "favoriteArtists";
const FAVORITE_ARTIST_KEYS = [FAVORITE_ARTISTS_KEY] as const;

function createEmptyFavoriteArtistsPage(
  limit = FAVORITE_ARTISTS_PAGE_SIZE,
): FavoriteArtistsPage {
  return {
    items: [],
    limit,
    total: 0,
    nextCursor: null,
    hasMore: false,
  };
}

function appendFavoriteArtistsPage(
  currentPage: FavoriteArtistsPage,
  nextPage: FavoriteArtistsPage,
): FavoriteArtistsPage {
  return {
    ...nextPage,
    items: [...currentPage.items, ...nextPage.items],
    limit: currentPage.limit,
    total: Math.max(currentPage.total, nextPage.total),
  };
}

interface SpotifyFavoriteArtistsContextValue {
  favoriteArtists: SpotifyArtist[];
  favoriteArtistsHasMore: boolean;
  favoriteArtistsLoading: boolean;
  favoriteArtistsLoadingMore: boolean;
  loadFavoriteArtists: (forceRefresh?: boolean) => Promise<void>;
  loadMoreFavoriteArtists: () => Promise<void>;
}

export const SpotifyFavoriteArtistsContext =
  createContext<SpotifyFavoriteArtistsContextValue | null>(null);

export function useSpotifyFavoriteArtistsState(): SpotifyFavoriteArtistsContextValue {
  const emptyPageRef = useRef(createEmptyFavoriteArtistsPage());
  const forceRefreshRef = useRef(false);
  const {
    data,
    dataRef,
    loading,
    refreshing,
    refresh,
    reload,
    requestVersionRef,
    setData,
  } = useStableAction<FavoriteArtistsPage>({
    initialData: emptyPageRef.current,
    keepDataOnLoad: true,
    load: useCallback(async () => {
      const forceRefresh = forceRefreshRef.current;
      forceRefreshRef.current = false;

      return await getSpotifyFavoriteArtistsPage(
        undefined,
        FAVORITE_ARTISTS_PAGE_SIZE,
        forceRefresh,
      );
    }, []),
  });

  const favoriteArtistsPage = data ?? emptyPageRef.current;
  const {
    loadMore,
    loadingByKey,
    resetLoadingState: resetFavoriteArtistsLoadingState,
  } = useStablePaginatedAction<
    typeof FAVORITE_ARTISTS_KEY,
    FavoriteArtistsPage,
    FavoriteArtistsPage,
    string
  >({
    dataRef,
    getCurrentPage: (page) => page,
    getNextPageParam: (page) => page.nextCursor,
    keys: FAVORITE_ARTIST_KEYS,
    loadPage: useCallback(
      async (_key, after, currentPage) => {
        return await getSpotifyFavoriteArtistsPage(after, currentPage.limit);
      },
      [],
    ),
    mergePages: appendFavoriteArtistsPage,
    onError: () => {},
    requestVersionRef,
    setCurrentPage: (_data, _key, page) => page,
    setData,
  });

  const loadFavoriteArtists = useCallback(
    async (forceRefresh = false) => {
      forceRefreshRef.current = forceRefresh;
      resetFavoriteArtistsLoadingState();

      if (forceRefresh) {
        await refresh();
        return;
      }

      await reload();
    },
    [refresh, reload, resetFavoriteArtistsLoadingState],
  );

  const loadMoreFavoriteArtists = useCallback(async () => {
    await loadMore(FAVORITE_ARTISTS_KEY);
  }, [loadMore]);

  return useMemo(
    () => ({
      favoriteArtists: favoriteArtistsPage.items,
      favoriteArtistsHasMore: favoriteArtistsPage.hasMore,
      favoriteArtistsLoading: loading || refreshing,
      favoriteArtistsLoadingMore: loadingByKey[FAVORITE_ARTISTS_KEY],
      loadFavoriteArtists,
      loadMoreFavoriteArtists,
    }),
    [
      favoriteArtistsPage,
      loading,
      refreshing,
      loadingByKey,
      loadFavoriteArtists,
      loadMoreFavoriteArtists,
    ],
  );
}

export function useSpotifyFavoriteArtists() {
  const ctx = useContext(SpotifyFavoriteArtistsContext);
  if (!ctx) {
    throw new Error(
      "useSpotifyFavoriteArtists must be used within SpotifyActivityProvider",
    );
  }

  return ctx;
}
