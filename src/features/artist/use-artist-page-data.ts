import { useCallback, useEffect, useRef, useState } from "react";

import type {
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
  SpotifyPage,
} from "@/features/spotify-client/types";
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
  const [data, setData] = useState<SpotifyArtistPageData | null>(null);
  const [loading, setLoading] = useState(Boolean(artistId));
  const [refreshing, setRefreshing] = useState(false);
  const [loadingReleaseGroups, setLoadingReleaseGroups] =
    useState<ReleaseLoadingState>(initialReleaseLoadingState);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const dataRef = useRef<SpotifyArtistPageData | null>(null);
  const loadingReleaseGroupsRef = useRef<Set<SpotifyArtistReleaseGroup>>(
    new Set(),
  );

  const load = useCallback(
    async (mode: "load" | "refresh") => {
      if (!artistId) {
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      setError(null);
      loadingReleaseGroupsRef.current.clear();
      setLoadingReleaseGroups(initialReleaseLoadingState);
      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setData(null);
        dataRef.current = null;
        setLoading(true);
        setRefreshing(false);
      }

      try {
        const nextData = await getSpotifyArtistPageData(artistId);
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
        setData(nextData ?? null);
        dataRef.current = nextData ?? null;
      } catch (nextError) {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }
        setData(null);
        dataRef.current = null;
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not load artist right now.",
        );
      }

      if (requestVersionRef.current !== requestVersion) {
        return;
      }
      setLoading(false);
      setRefreshing(false);
    },
    [artistId],
  );

  useEffect(() => {
    requestVersionRef.current += 1;

    if (!artistId) {
      setData(null);
      dataRef.current = null;
      setLoading(false);
      setRefreshing(false);
      loadingReleaseGroupsRef.current.clear();
      setLoadingReleaseGroups(initialReleaseLoadingState);
      setError(null);
      return;
    }

    void load("load");
  }, [artistId, load]);

  const refresh = useCallback(async () => {
    await load("refresh");
  }, [load]);

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

          const nextData = setReleasePage(
            previous,
            includeGroups,
            appendSpotifyPage(previousPage, nextPage),
          );
          dataRef.current = nextData;
          return nextData;
        });
      } finally {
        loadingReleaseGroupsRef.current.delete(includeGroups);
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setLoadingReleaseGroups((current) => ({
          ...current,
          [includeGroups]: false,
        }));
      }
    },
    [artistId],
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
