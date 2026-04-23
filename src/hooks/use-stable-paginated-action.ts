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
  TPage,
  TPageParam,
> {
  arePageParamsEqual?: (
    left: TPageParam | null,
    right: TPageParam | null,
  ) => boolean;
  dataRef: MutableRefObject<TData | null>;
  getCurrentPage: (data: TData, key: TKey) => TPage;
  getNextPageParam: (page: TPage) => TPageParam | null;
  keys: readonly TKey[];
  loadPage: (
    key: TKey,
    requestedPageParam: TPageParam,
    currentPage: TPage,
  ) => Promise<TPage | null>;
  mergePages: (currentPage: TPage, nextPage: TPage) => TPage;
  onError?: (error: unknown, key: TKey, requestedPageParam: TPageParam) => void;
  requestVersionRef: MutableRefObject<number>;
  setCurrentPage: (data: TData, key: TKey, page: TPage) => TData;
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

function defaultArePageParamsEqual<TPageParam>(
  left: TPageParam | null,
  right: TPageParam | null,
) {
  return Object.is(left, right);
}

export function useStablePaginatedAction<
  TKey extends string,
  TData,
  TPage,
  TPageParam,
>({
  arePageParamsEqual = defaultArePageParamsEqual,
  dataRef,
  getCurrentPage,
  getNextPageParam,
  keys,
  loadPage,
  mergePages,
  onError,
  requestVersionRef,
  setCurrentPage,
  setData,
}: UseStablePaginatedActionOptions<TKey, TData, TPage, TPageParam>) {
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
      const requestedPageParam = getNextPageParam(currentPage);
      if (
        requestedPageParam === null ||
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
        const nextPage = await loadPage(key, requestedPageParam, currentPage);
        if (!nextPage) {
          return;
        }

        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setData((previous) => {
          if (!previous) {
            return previous;
          }

          const previousPage = getCurrentPage(previous, key);
          if (
            !arePageParamsEqual(
              getNextPageParam(previousPage),
              requestedPageParam,
            )
          ) {
            return previous;
          }

          return setCurrentPage(
            previous,
            key,
            mergePages(previousPage, nextPage),
          );
        });
      } catch (error) {
        if (!onError) {
          throw error;
        }

        onError(error, key, requestedPageParam);
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
      arePageParamsEqual,
      dataRef,
      getCurrentPage,
      getNextPageParam,
      loadPage,
      mergePages,
      onError,
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
