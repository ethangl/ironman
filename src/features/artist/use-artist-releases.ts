import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
} from "react";

import type {
  SpotifyAlbumRelease,
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
  SpotifyPage,
} from "@/features/spotify-client/types";
import { useStablePaginatedAction } from "@/hooks/use-stable-paginated-action";
import { getSpotifyArtistReleasesPage } from "./spotify-artist-client";

export type ArtistReleaseLoadingState = Record<
  SpotifyArtistReleaseGroup,
  boolean
>;

const ARTIST_RELEASE_GROUPS = ["album", "single"] as const;

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
  const loadPage = useCallback(
    async (
      includeGroups: SpotifyArtistReleaseGroup,
      requestedOffset: number,
      limit: number,
    ) => {
      return await getSpotifyArtistReleasesPage(
        artistId,
        includeGroups,
        requestedOffset,
        limit,
      );
    },
    [artistId],
  );

  const {
    loadMore,
    loadingByKey,
    resetLoadingState: resetReleaseLoadingState,
  } = useStablePaginatedAction<
    SpotifyArtistReleaseGroup,
    SpotifyArtistPageData,
    SpotifyAlbumRelease
  >({
    dataRef,
    getCurrentPage: getReleasePage,
    keys: ARTIST_RELEASE_GROUPS,
    loadPage,
    requestVersionRef,
    setCurrentPage: setReleasePage,
    setData,
  });

  return {
    loadMoreReleases: loadMore,
    loadingReleaseGroups: loadingByKey as ArtistReleaseLoadingState,
    resetReleaseLoadingState,
  };
}
