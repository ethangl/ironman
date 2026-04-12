import { useCallback, useEffect, useRef, useState } from "react";

import type { ActivityBootstrap, SpotifyClient } from "@/features/spotify/client";
import type {
  FavoriteArtist,
  Playlist,
  RecentTrack,
} from "@/types/spotify-activity";
import { SPOTIFY_ACTIVITY_BOOTSTRAP_STORAGE_KEY_PREFIX } from "@/lib/spotify-client-cache";

const ACTIVITY_BOOTSTRAP_TTL_MS = 10_000;
const PERSISTED_ACTIVITY_BOOTSTRAP_TTL_MS = 5 * 60_000;

let activityBootstrapCache: ActivityBootstrap | null = null;
let activityBootstrapCacheUserId: string | null = null;
let activityBootstrapExpiresAt = 0;
let activityBootstrapInFlight: Promise<ActivityBootstrap> | null = null;
let activityBootstrapInFlightUserId: string | null = null;

function dedupeRecent(raw: RecentTrack[]) {
  const seen = new Set<string>();
  const deduped: RecentTrack[] = [];

  for (const item of raw) {
    if (seen.has(item.track.id)) {
      continue;
    }

    seen.add(item.track.id);
    deduped.push(item);
  }

  return deduped;
}

function getActivityBootstrapStorageKey(userId: string) {
  return `${SPOTIFY_ACTIVITY_BOOTSTRAP_STORAGE_KEY_PREFIX}${userId}`;
}

function readPersistedActivityBootstrap(
  userId: string | null,
): ActivityBootstrap | null {
  if (!userId || typeof window === "undefined") {
    return null;
  }

  const storageKey = getActivityBootstrapStorageKey(userId);

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      expiresAt?: number;
      value?: ActivityBootstrap;
    };

    if (!parsed.expiresAt || !parsed.value || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsed.value;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function writePersistedActivityBootstrap(
  userId: string | null,
  bootstrap: ActivityBootstrap,
) {
  if (!userId || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getActivityBootstrapStorageKey(userId),
      JSON.stringify({
        expiresAt: Date.now() + PERSISTED_ACTIVITY_BOOTSTRAP_TTL_MS,
        value: bootstrap,
      }),
    );
  } catch {
    // Ignore storage failures and fall back to in-memory state.
  }
}

async function loadActivityBootstrap(
  client: SpotifyClient,
  userId: string | null,
): Promise<ActivityBootstrap> {
  const now = Date.now();
  if (
    activityBootstrapCache &&
    activityBootstrapCacheUserId === userId &&
    activityBootstrapExpiresAt > now
  ) {
    return activityBootstrapCache;
  }

  if (
    activityBootstrapInFlight &&
    activityBootstrapInFlightUserId === userId
  ) {
    return activityBootstrapInFlight;
  }

  activityBootstrapInFlightUserId = userId;
  activityBootstrapInFlight = client.spotifyActivity
    .loadBootstrap()
    .then((bootstrap) => {
      activityBootstrapCache = bootstrap;
      activityBootstrapCacheUserId = userId;
      activityBootstrapExpiresAt = Date.now() + ACTIVITY_BOOTSTRAP_TTL_MS;
      writePersistedActivityBootstrap(userId, bootstrap);
      return bootstrap;
    })
    .finally(() => {
      activityBootstrapInFlight = null;
      activityBootstrapInFlightUserId = null;
    });

  return activityBootstrapInFlight;
}

function hasVisibleActivity(bootstrap: ActivityBootstrap | null) {
  if (!bootstrap) {
    return false;
  }

  return (
    bootstrap.recentTracks.length > 0 ||
    bootstrap.playlists.length > 0 ||
    bootstrap.favoriteArtists.length > 0
  );
}

export function useSpotifyActivityBootstrap({
  client,
  enabled,
  userId,
}: {
  client: SpotifyClient;
  enabled: boolean;
  userId: string | null;
}) {
  const initialBootstrap = readPersistedActivityBootstrap(userId);
  const [recentTracks, setRecentTracksState] = useState<RecentTrack[]>(
    () => dedupeRecent(initialBootstrap?.recentTracks ?? []),
  );
  const [playlists, setPlaylists] = useState<Playlist[]>(
    () => initialBootstrap?.playlists ?? [],
  );
  const [playlistsTotal, setPlaylistsTotal] = useState(
    () => initialBootstrap?.playlistsTotal ?? 0,
  );
  const [favoriteArtists, setFavoriteArtists] = useState<FavoriteArtist[]>(
    () => initialBootstrap?.favoriteArtists ?? [],
  );
  const [loading, setLoading] = useState(false);
  const [bootstrapVersion, setBootstrapVersion] = useState(0);
  const hasVisibleActivityRef = useRef(hasVisibleActivity(initialBootstrap));

  const applyBootstrap = useCallback((bootstrap: ActivityBootstrap | null) => {
    if (!bootstrap) {
      setRecentTracksState([]);
      setPlaylists([]);
      setPlaylistsTotal(0);
      setFavoriteArtists([]);
      hasVisibleActivityRef.current = false;
      setBootstrapVersion((current) => current + 1);
      return;
    }

    const dedupedRecentTracks = dedupeRecent(bootstrap.recentTracks);
    setRecentTracksState(dedupedRecentTracks);
    setPlaylists(bootstrap.playlists);
    setPlaylistsTotal(bootstrap.playlistsTotal);
    setFavoriteArtists(bootstrap.favoriteArtists);
    hasVisibleActivityRef.current =
      dedupedRecentTracks.length > 0 ||
      bootstrap.playlists.length > 0 ||
      bootstrap.favoriteArtists.length > 0;
    setBootstrapVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      applyBootstrap(null);
      setLoading(false);
      return;
    }

    applyBootstrap(readPersistedActivityBootstrap(userId));
  }, [applyBootstrap, enabled, userId]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(!hasVisibleActivityRef.current);
    try {
      const bootstrap = await loadActivityBootstrap(client, userId);
      applyBootstrap(bootstrap);
    } finally {
      setLoading(false);
    }
  }, [applyBootstrap, client, enabled, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setRecentTracks = useCallback((nextRecentTracks: RecentTrack[]) => {
    const dedupedRecentTracks = dedupeRecent(nextRecentTracks);
    setRecentTracksState(dedupedRecentTracks);
    hasVisibleActivityRef.current =
      dedupedRecentTracks.length > 0 ||
      playlists.length > 0 ||
      favoriteArtists.length > 0;
  }, [favoriteArtists.length, playlists.length]);

  return {
    recentTracks,
    setRecentTracks,
    playlists,
    setPlaylists,
    playlistsTotal,
    setPlaylistsTotal,
    favoriteArtists,
    loading,
    refresh,
    bootstrapVersion,
  };
}
