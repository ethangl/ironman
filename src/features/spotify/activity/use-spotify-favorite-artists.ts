import { useCallback } from "react";

import { useSpotifyClient } from "@/features/spotify/client";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { SPOTIFY_FAVORITE_ARTISTS_STORAGE_KEY_PREFIX } from "@/lib/spotify-client-cache";
import { useAppAuth } from "@/app";
import type { FavoriteArtist } from "@/types/spotify-activity";

const FAVORITE_ARTISTS_CACHE_TTL_MS = 5 * 60_000;

function getFavoriteArtistsCacheKey(userId: string | null) {
  return `${SPOTIFY_FAVORITE_ARTISTS_STORAGE_KEY_PREFIX}${userId ?? "anon"}`;
}

export function useSpotifyFavoriteArtists({
  enabled,
  initialData,
}: {
  enabled: boolean;
  initialData?: FavoriteArtist[];
}) {
  const client = useSpotifyClient();
  const { session } = useAppAuth();
  const sessionUserId = session?.user.id ?? null;
  const queryFn = useCallback(
    () => client.spotifyActivity.getFavoriteArtists(),
    [client],
  );

  return useCachedQuery<FavoriteArtist[]>({
    cacheKey: enabled ? getFavoriteArtistsCacheKey(sessionUserId) : null,
    queryFn,
    ttlMs: FAVORITE_ARTISTS_CACHE_TTL_MS,
    enabled,
    initialData,
  });
}
