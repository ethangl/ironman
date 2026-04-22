import { useCallback, useEffect, useRef, useState } from "react";

import type {
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
  SpotifyPage,
} from "@/features/spotify-client/types";
import { useStableAction } from "@/hooks/use-stable-action";
import {
  getSpotifyArtistPageData,
  getSpotifyArtistReleasesPage,
} from "./spotify-artist-client";

type ReleaseLoadingState = Record<SpotifyArtistReleaseGroup, boolean>;

const initialReleaseLoadingState: ReleaseLoadingState = {
  album: false,
  single: false,
};

function getReleasePage(
  data: SpotifyArtistPageData,
  includeGroups: SpotifyArtistReleaseGroup,
) {
  return includeGroups === "album" ? data.albums : data.singles;
}

function setReleasePage<TItem>(
  data: SpotifyArtistPageData,
  includeGroups: SpotifyArtistReleaseGroup,
  page: SpotifyPage<TItem>,
) {
  if (includeGroups === "album") {
    return {
      ...data,
      albums: page,
    };
  }

  return {
    ...data,
    singles: page,
  };
}

function appendSpotifyPage<TItem>(
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

export function useArtistPageData(artistId: string) {
  const [loadingReleaseGroups, setLoadingReleaseGroups] =
    useState<ReleaseLoadingState>(initialReleaseLoadingState);
  const loadingReleaseGroupsRef = useRef<Set<SpotifyArtistReleaseGroup>>(
    new Set(),
  );

  const resetReleaseLoadingState = useCallback(() => {
    loadingReleaseGroupsRef.current.clear();
    setLoadingReleaseGroups(initialReleaseLoadingState);
  }, []);

  const {
    data,
    dataRef,
    error,
    loading,
    refreshing,
    refresh: refreshArtistPage,
    requestVersionRef,
    setData,
  } = useStableAction<SpotifyArtistPageData>({
    enabled: Boolean(artistId),
    keepDataOnLoad: false,
    load: useCallback(async () => {
      if (!artistId) {
        return null;
      }

      return await getSpotifyArtistPageData(artistId);
    }, [artistId]),
    mapError: useCallback(
      (nextError: unknown) =>
        nextError instanceof Error
          ? nextError.message
          : "Could not load artist right now.",
      [],
    ),
  });

  useEffect(() => {
    resetReleaseLoadingState();
  }, [artistId, resetReleaseLoadingState]);

  const refresh = useCallback(async () => {
    resetReleaseLoadingState();
    await refreshArtistPage();
  }, [refreshArtistPage, resetReleaseLoadingState]);

  const loadMoreReleases = useCallback(
    async (includeGroups: SpotifyArtistReleaseGroup) => {
      if (!artistId) {
        return;
      }

      const currentData = dataRef.current;
      if (!currentData) {
        return;
      }

      const currentPage = getReleasePage(currentData, includeGroups);
      const requestedOffset = currentPage.nextOffset;
      if (
        !currentPage.hasMore ||
        requestedOffset === null ||
        loadingReleaseGroupsRef.current.has(includeGroups)
      ) {
        return;
      }

      const requestVersion = requestVersionRef.current;
      loadingReleaseGroupsRef.current.add(includeGroups);
      setLoadingReleaseGroups((current) => ({
        ...current,
        [includeGroups]: true,
      }));

      try {
        const nextPage = await getSpotifyArtistReleasesPage(
          artistId,
          includeGroups,
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

          const previousPage = getReleasePage(previous, includeGroups);
          if (previousPage.nextOffset !== requestedOffset) {
            return previous;
          }

          return setReleasePage(
            previous,
            includeGroups,
            appendSpotifyPage(previousPage, nextPage),
          );
        });
      } finally {
        loadingReleaseGroupsRef.current.delete(includeGroups);
        if (requestVersionRef.current === requestVersion) {
          setLoadingReleaseGroups((current) => ({
            ...current,
            [includeGroups]: false,
          }));
        }
      }
    },
    [artistId, dataRef, requestVersionRef, setData],
  );

  if (!artistId) {
    return {
      data: null,
      loading: false,
      refreshing: false,
      loadingReleaseGroups: initialReleaseLoadingState,
      error: null,
      notFound: true,
      loadMoreReleases,
      refresh,
    };
  }

  return {
    data: data ?? null,
    loading,
    refreshing,
    loadingReleaseGroups,
    error,
    notFound: !loading && !refreshing && !error && data === null,
    loadMoreReleases,
    refresh,
  };
}
