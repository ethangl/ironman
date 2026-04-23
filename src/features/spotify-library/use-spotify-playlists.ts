import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

import { PLAYLIST_PAGE_SIZE, type PlaylistsPage } from "@/features/spotify-client";
import type { Playlist } from "@/features/spotify-client/types";
import {
  appendSpotifyPage,
  useStablePaginatedAction,
} from "@/hooks/use-stable-paginated-action";
import { useStableAction } from "@/hooks/use-stable-action";
import { getSpotifyPlaylistsPage } from "@/features/spotify-playlists/spotify-playlist-client";

const PLAYLISTS_KEY = "playlists";
const PLAYLIST_KEYS = [PLAYLISTS_KEY] as const;

function createEmptyPlaylistsPage(limit = PLAYLIST_PAGE_SIZE): PlaylistsPage {
  return {
    items: [],
    offset: 0,
    limit,
    total: 0,
    nextOffset: null,
    hasMore: false,
  };
}

interface SpotifyPlaylistsContextValue {
  loadMorePlaylists: () => Promise<void>;
  loadPlaylists: (forceRefresh?: boolean) => Promise<void>;
  playlists: Playlist[];
  playlistsHasMore: boolean;
  playlistsLoading: boolean;
  playlistsLoadingMore: boolean;
}

export const SpotifyPlaylistsContext =
  createContext<SpotifyPlaylistsContextValue | null>(null);

export function useSpotifyPlaylistsState(): SpotifyPlaylistsContextValue {
  const emptyPageRef = useRef(createEmptyPlaylistsPage());
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
  } = useStableAction<PlaylistsPage>({
    initialData: emptyPageRef.current,
    keepDataOnLoad: true,
    load: useCallback(async () => {
      const forceRefresh = forceRefreshRef.current;
      forceRefreshRef.current = false;

      return await getSpotifyPlaylistsPage(0, PLAYLIST_PAGE_SIZE, forceRefresh);
    }, []),
  });

  const playlistsPage = data ?? emptyPageRef.current;
  const {
    loadMore,
    loadingByKey,
    resetLoadingState: resetPlaylistLoadingState,
  } = useStablePaginatedAction<
    typeof PLAYLISTS_KEY,
    PlaylistsPage,
    PlaylistsPage,
    number
  >({
    dataRef,
    getCurrentPage: (page) => page,
    getNextPageParam: (page) => page.nextOffset,
    keys: PLAYLIST_KEYS,
    loadPage: useCallback(
      async (_key, offset, currentPage) => {
        return await getSpotifyPlaylistsPage(offset, currentPage.limit);
      },
      [],
    ),
    mergePages: appendSpotifyPage,
    onError: () => {},
    requestVersionRef,
    setCurrentPage: (_data, _key, page) => page,
    setData,
  });

  const loadPlaylists = useCallback(
    async (forceRefresh = false) => {
      forceRefreshRef.current = forceRefresh;
      resetPlaylistLoadingState();

      if (forceRefresh) {
        await refresh();
        return;
      }

      await reload();
    },
    [refresh, reload, resetPlaylistLoadingState],
  );

  const loadMorePlaylists = useCallback(async () => {
    await loadMore(PLAYLISTS_KEY);
  }, [loadMore]);

  return useMemo(
    () => ({
      loadMorePlaylists,
      loadPlaylists,
      playlists: playlistsPage.items,
      playlistsHasMore: playlistsPage.hasMore,
      playlistsLoading: loading || refreshing,
      playlistsLoadingMore: loadingByKey[PLAYLISTS_KEY],
    }),
    [loadMorePlaylists, loadPlaylists, playlistsPage, loading, refreshing, loadingByKey],
  );
}

export function useSpotifyPlaylists() {
  const ctx = useContext(SpotifyPlaylistsContext);
  if (!ctx) {
    throw new Error(
      "useSpotifyPlaylists must be used within SpotifyActivityProvider",
    );
  }

  return ctx;
}
