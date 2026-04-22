import { useCallback, useEffect } from "react";

import type {
  SpotifyArtistPageData,
} from "@/features/spotify-client/types";
import { useStableAction } from "@/hooks/use-stable-action";
import { getSpotifyArtistPageData } from "./spotify-artist-client";
import { useArtistReleases } from "./use-artist-releases";

export function useArtistPageData(artistId: string) {
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

  const {
    loadMoreReleases,
    loadingReleaseGroups,
    resetReleaseLoadingState,
  } = useArtistReleases({
    artistId,
    dataRef,
    requestVersionRef,
    setData,
  });

  useEffect(() => {
    resetReleaseLoadingState();
  }, [artistId, resetReleaseLoadingState]);

  const refresh = useCallback(async () => {
    resetReleaseLoadingState();
    await refreshArtistPage();
  }, [refreshArtistPage, resetReleaseLoadingState]);

  if (!artistId) {
    return {
      data: null,
      loading: false,
      refreshing: false,
      loadingReleaseGroups,
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
