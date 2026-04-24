import { useCallback } from "react";

import type { SpotifyAlbumDetails } from "@/features/spotify-client/types";
import { useStableAction } from "@/hooks/use-stable-action";
import { getSpotifyReleasePageData } from "./spotify-release-client";

export function useReleasePageData(releaseId: string) {
  const {
    data,
    error,
    loading,
    refreshing,
    refresh: refreshReleasePage,
  } = useStableAction<SpotifyAlbumDetails>({
    enabled: Boolean(releaseId),
    keepDataOnLoad: false,
    load: useCallback(async () => {
      if (!releaseId) {
        return null;
      }

      return await getSpotifyReleasePageData(releaseId);
    }, [releaseId]),
    mapError: useCallback(
      (nextError: unknown) =>
        nextError instanceof Error
          ? nextError.message
          : "Could not load release right now.",
      [],
    ),
  });

  const refresh = useCallback(async () => {
    await refreshReleasePage();
  }, [refreshReleasePage]);

  if (!releaseId) {
    return {
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      notFound: true,
      refresh,
    };
  }

  return {
    data: data ?? null,
    loading,
    refreshing,
    error,
    notFound: !loading && !refreshing && !error && data === null,
    refresh,
  };
}
