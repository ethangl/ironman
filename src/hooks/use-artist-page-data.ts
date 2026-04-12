import { useCallback } from "react";

import { useAppDataClient } from "@/data/client";
import { SPOTIFY_ARTIST_PAGE_STORAGE_KEY_PREFIX } from "@/lib/spotify-client-cache";
import { useAppAuth } from "@/runtime/app-runtime";
import { SpotifyArtistPageData } from "@/types";

import { useCachedQuery } from "./use-cached-query";

const ARTIST_PAGE_CACHE_TTL_MS = 30 * 60_000;

function getArtistPageCacheKey(userId: string | null, artistId: string) {
  return `${SPOTIFY_ARTIST_PAGE_STORAGE_KEY_PREFIX}${userId ?? "anon"}:${artistId}`;
}

export function useArtistPageData(artistId: string) {
  const client = useAppDataClient();
  const { session } = useAppAuth();
  const sessionUserId = session?.user.id ?? null;
  const enabled = !!artistId;
  const queryFn = useCallback(
    () => client.artists.getPageData(artistId),
    [artistId, client],
  );
  const { data, loading, refreshing, error, refresh } =
    useCachedQuery<SpotifyArtistPageData | null>({
      cacheKey: enabled ? getArtistPageCacheKey(sessionUserId, artistId) : null,
      queryFn,
      ttlMs: ARTIST_PAGE_CACHE_TTL_MS,
      enabled,
    });

  if (!artistId) {
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
