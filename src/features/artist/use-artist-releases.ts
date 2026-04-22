import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";

import type {
  SpotifyAlbumRelease,
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
  SpotifyPage,
} from "@/features/spotify-client/types";
import { getSpotifyArtistReleasesPage } from "./spotify-artist-client";

export type ArtistReleaseLoadingState = Record<
  SpotifyArtistReleaseGroup,
  boolean
>;

const initialReleaseLoadingState: ArtistReleaseLoadingState = {
  album: false,
  single: false,
};

function getReleasePage(
  data: SpotifyArtistPageData,
  includeGroups: SpotifyArtistReleaseGroup,
) {
  return includeGroups === "album" ? data.albums : data.singles;
}

function setReleasePage(
  data: SpotifyArtistPageData,
  includeGroups: SpotifyArtistReleaseGroup,
  page: SpotifyPage<SpotifyAlbumRelease>,
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

export function useArtistReleases({
  artistId,
  dataRef,
  requestVersionRef,
  setData,
}: {
  artistId: string;
  dataRef: MutableRefObject<SpotifyArtistPageData | null>;
  requestVersionRef: MutableRefObject<number>;
  setData: Dispatch<SetStateAction<SpotifyArtistPageData | null>>;
}) {
  const [loadingReleaseGroups, setLoadingReleaseGroups] =
    useState<ArtistReleaseLoadingState>(initialReleaseLoadingState);
  const loadingReleaseGroupsRef = useRef<Set<SpotifyArtistReleaseGroup>>(
    new Set(),
  );

  const resetReleaseLoadingState = useCallback(() => {
    loadingReleaseGroupsRef.current.clear();
    setLoadingReleaseGroups(initialReleaseLoadingState);
  }, []);

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

  return {
    loadMoreReleases,
    loadingReleaseGroups,
    resetReleaseLoadingState,
  };
}
