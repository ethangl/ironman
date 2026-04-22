import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import type { SpotifyPage } from "@/features/spotify-client/types";

export type PaginatedLoadingState<TKey extends string> = Record<TKey, boolean>;

export interface UseStablePaginatedActionOptions<
  TKey extends string,
  TData,
  TItem,
> {
  dataRef: MutableRefObject<TData | null>;
  getCurrentPage: (data: TData, key: TKey) => SpotifyPage<TItem>;
  keys: readonly TKey[];
  loadPage: (
    key: TKey,
    requestedOffset: number,
    limit: number,
  ) => Promise<SpotifyPage<TItem>>;
  mergePages?: (
    currentPage: SpotifyPage<TItem>,
    nextPage: SpotifyPage<TItem>,
  ) => SpotifyPage<TItem>;
  requestVersionRef: MutableRefObject<number>;
  setCurrentPage: (data: TData, key: TKey, page: SpotifyPage<TItem>) => TData;
  setData: Dispatch<SetStateAction<TData | null>>;
}

function createLoadingState<TKey extends string>(
  keys: readonly TKey[],
): PaginatedLoadingState<TKey> {
  return keys.reduce<PaginatedLoadingState<TKey>>((state, key) => {
    state[key] = false;
    return state;
  }, {} as PaginatedLoadingState<TKey>);
}

export function appendSpotifyPage<TItem>(
  currentPage: SpotifyPage<TItem>,
  nextPage: SpotifyPage<TItem>,
): SpotifyPage<TItem> {
  return {
    ...nextPage,
    items: [...currentPage.items, ...nextPage.items],
    offset: currentPage.offset,
    limit: currentPage.limit,
  };
}

export function useStablePaginatedAction<TKey extends string, TData, TItem>({
  dataRef,
  getCurrentPage,
  keys,
  loadPage,
  mergePages = appendSpotifyPage,
  requestVersionRef,
  setCurrentPage,
  setData,
}: UseStablePaginatedActionOptions<TKey, TData, TItem>) {
  const initialLoadingState = useMemo(() => createLoadingState(keys), [keys]);
  const [loadingByKey, setLoadingByKey] =
    useState<PaginatedLoadingState<TKey>>(initialLoadingState);
  const loadingKeysRef = useRef<Set<TKey>>(new Set());

  const resetLoadingState = useCallback(() => {
    loadingKeysRef.current.clear();
    setLoadingByKey(initialLoadingState);
  }, [initialLoadingState]);

  const loadMore = useCallback(
    async (key: TKey) => {
      const currentData = dataRef.current;
      if (!currentData) {
        return;
      }

      const currentPage = getCurrentPage(currentData, key);
      const requestedOffset = currentPage.nextOffset;
      if (
        !currentPage.hasMore ||
        requestedOffset === null ||
        loadingKeysRef.current.has(key)
      ) {
        return;
      }

      const requestVersion = requestVersionRef.current;
      loadingKeysRef.current.add(key);
      setLoadingByKey((current) => ({
        ...current,
        [key]: true,
      }));

      try {
        const nextPage = await loadPage(
          key,
          requestedOffset,
          currentPage.limit,
        );

        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setData((previous) => {
          if (!previous) {
            return previous;
          }

          const previousPage = getCurrentPage(previous, key);
          if (previousPage.nextOffset !== requestedOffset) {
            return previous;
          }

          return setCurrentPage(
            previous,
            key,
            mergePages(previousPage, nextPage),
          );
        });
      } finally {
        loadingKeysRef.current.delete(key);
        if (requestVersionRef.current === requestVersion) {
          setLoadingByKey((current) => ({
            ...current,
            [key]: false,
          }));
        }
      }
    },
    [
      dataRef,
      getCurrentPage,
      loadPage,
      mergePages,
      requestVersionRef,
      setCurrentPage,
      setData,
    ],
  );

  return {
    loadMore,
    loadingByKey,
    resetLoadingState,
  };
}
