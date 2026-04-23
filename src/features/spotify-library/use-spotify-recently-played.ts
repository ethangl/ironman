import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

import { RECENTLY_PLAYED_LIMIT } from "@/features/spotify-client";
import type {
  RecentTrack,
  RecentlyPlayedPage,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { useStableAction } from "@/hooks/use-stable-action";
import { useStablePaginatedAction } from "@/hooks/use-stable-paginated-action";
import { getSpotifyRecentlyPlayedPage } from "./spotify-recently-played-client";

const RECENT_TRACKS_KEY = "recent";
const RECENT_TRACK_KEYS = [RECENT_TRACKS_KEY] as const;

function createEmptyRecentlyPlayedPage(
  limit = RECENTLY_PLAYED_LIMIT,
): RecentlyPlayedPage {
  return {
    items: [],
    limit,
    total: 0,
    nextCursor: null,
    hasMore: false,
  };
}

function mergeRecentTrackPages(
  currentPage: RecentlyPlayedPage,
  nextPage: RecentlyPlayedPage,
): RecentlyPlayedPage {
  const items = [...currentPage.items, ...nextPage.items];

  return {
    ...nextPage,
    items,
    limit: currentPage.limit,
    total: Math.max(currentPage.total, nextPage.total, items.length),
  };
}

function prependRecentTrack(
  page: RecentlyPlayedPage,
  track: SpotifyTrack,
): RecentlyPlayedPage {
  const nextItems = [
    {
      playedAt: new Date().toISOString(),
      track,
    },
    ...page.items,
  ];
  const items =
    page.items.length > RECENTLY_PLAYED_LIMIT
      ? nextItems
      : nextItems.slice(0, RECENTLY_PLAYED_LIMIT);

  return {
    ...page,
    items,
    total: Math.max(page.total, items.length),
  };
}

interface SpotifyRecentlyPlayedContextValue {
  appendRecentTrack: (track: SpotifyTrack) => void;
  loadMoreRecentTracks: () => Promise<void>;
  loading: boolean;
  recentTracks: RecentTrack[];
  recentTracksHasMore: boolean;
  recentTracksLoadingMore: boolean;
  refresh: () => Promise<void>;
}

export const SpotifyRecentlyPlayedContext =
  createContext<SpotifyRecentlyPlayedContextValue | null>(null);

export function useSpotifyRecentlyPlayedState(): SpotifyRecentlyPlayedContextValue {
  const emptyPageRef = useRef(createEmptyRecentlyPlayedPage());
  const preservedPageRef = useRef(emptyPageRef.current);
  const {
    data,
    dataRef,
    loading: recentTracksLoading,
    refreshing: recentTracksRefreshing,
    refresh: refreshRecentTracks,
    requestVersionRef,
    setData,
  } = useStableAction<RecentlyPlayedPage>({
    initialData: emptyPageRef.current,
    keepDataOnLoad: true,
    load: useCallback(async () => {
      const recentlyPlayed = await getSpotifyRecentlyPlayedPage();
      if (recentlyPlayed.rateLimited) {
        return preservedPageRef.current;
      }

      return recentlyPlayed.page;
    }, []),
  });

  const recentTracksPage = data ?? emptyPageRef.current;
  preservedPageRef.current = recentTracksPage;

  const {
    loadMore,
    loadingByKey,
    resetLoadingState: resetRecentTracksLoadingState,
  } = useStablePaginatedAction<
    typeof RECENT_TRACKS_KEY,
    RecentlyPlayedPage,
    RecentlyPlayedPage,
    number
  >({
    dataRef,
    getCurrentPage: (page) => page,
    getNextPageParam: (page) => page.nextCursor,
    keys: RECENT_TRACK_KEYS,
    loadPage: useCallback(
      async (_key, before, currentPage) => {
        const recentlyPlayed = await getSpotifyRecentlyPlayedPage(
          before,
          currentPage.limit,
        );
        return recentlyPlayed.rateLimited ? null : recentlyPlayed.page;
      },
      [],
    ),
    mergePages: mergeRecentTrackPages,
    onError: () => {},
    requestVersionRef,
    setCurrentPage: (_data, _key, page) => page,
    setData,
  });

  const appendRecentTrack = useCallback(
    (track: SpotifyTrack) => {
      setData((current) => prependRecentTrack(current ?? emptyPageRef.current, track));
    },
    [setData],
  );

  const refresh = useCallback(async () => {
    resetRecentTracksLoadingState();
    await refreshRecentTracks();
  }, [refreshRecentTracks, resetRecentTracksLoadingState]);

  const loadMoreRecentTracks = useCallback(async () => {
    await loadMore(RECENT_TRACKS_KEY);
  }, [loadMore]);

  return useMemo(
    () => ({
      appendRecentTrack,
      loadMoreRecentTracks,
      loading: recentTracksLoading || recentTracksRefreshing,
      recentTracks: recentTracksPage.items,
      recentTracksHasMore: recentTracksPage.hasMore,
      recentTracksLoadingMore: loadingByKey[RECENT_TRACKS_KEY],
      refresh,
    }),
    [
      appendRecentTrack,
      loadMoreRecentTracks,
      recentTracksLoading,
      recentTracksRefreshing,
      recentTracksPage,
      loadingByKey,
      refresh,
    ],
  );
}

export function useSpotifyRecentlyPlayed() {
  const ctx = useContext(SpotifyRecentlyPlayedContext);
  if (!ctx) {
    throw new Error(
      "useSpotifyRecentlyPlayed must be used within SpotifyActivityProvider",
    );
  }

  return ctx;
}
