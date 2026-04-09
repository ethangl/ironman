import { useCallback, useEffect, useRef, useState } from "react";

import { useAppDataClient, type AppDataClient } from "@/data/client";
import {
  type ActivityBootstrap,
  PLAYLIST_PAGE_SIZE,
} from "@/data/spotify-activity";
import {
  FavoriteArtist,
  Playlist,
  RecentTrack,
  SpotifyActivityContext,
} from "@/hooks/use-spotify-activity";
import { useAppCapabilities } from "@/runtime/app-runtime";

const RECENT_POLL_MS = 30_000;
const ACTIVITY_BOOTSTRAP_TTL_MS = 10_000;

let activityBootstrapCache: ActivityBootstrap | null = null;
let activityBootstrapExpiresAt = 0;
let activityBootstrapInFlight: Promise<ActivityBootstrap> | null = null;

async function loadActivityBootstrap(client: AppDataClient): Promise<ActivityBootstrap> {
  const now = Date.now();
  if (activityBootstrapCache && activityBootstrapExpiresAt > now) {
    return activityBootstrapCache;
  }

  if (activityBootstrapInFlight) {
    return activityBootstrapInFlight;
  }

  activityBootstrapInFlight = Promise.all([
    client.spotifyActivity.getRecentlyPlayed(),
    client.spotifyActivity.getPlaylistsPage(PLAYLIST_PAGE_SIZE, 0),
    client.spotifyActivity.getTopArtists(),
  ])
    .then(([recentResult, playlistData, artistData]) => {
      const recentTracks = recentResult.rateLimited
        ? (activityBootstrapCache?.recentTracks ?? [])
        : recentResult.items;

      const bootstrap = {
        favoriteArtists: artistData as FavoriteArtist[],
        recentTracks: recentTracks as RecentTrack[],
        playlists: playlistData.items as Playlist[],
        playlistsTotal: playlistData.total as number,
      };

      activityBootstrapCache = bootstrap;
      activityBootstrapExpiresAt = Date.now() + ACTIVITY_BOOTSTRAP_TTL_MS;
      return bootstrap;
    })
    .finally(() => {
      activityBootstrapInFlight = null;
    });

  return activityBootstrapInFlight;
}

export function SpotifyActivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useAppDataClient();
  const { canBrowsePersonalSpotify } = useAppCapabilities();

  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
  const [favoriteArtists, setFavoriteArtists] = useState<FavoriteArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const offsetRef = useRef(0);
  const playlistTracksRef = useRef(new Map<string, Playlist["tracks"]>());

  const dedupeRecent = (raw: RecentTrack[]) => {
    const seen = new Set<string>();
    const deduped: RecentTrack[] = [];
    for (const item of raw) {
      if (!seen.has(item.track.id)) {
        seen.add(item.track.id);
        deduped.push(item);
      }
    }
    return deduped;
  };

  const fetchRecent = useCallback(async () => {
    if (!canBrowsePersonalSpotify) return;
    const result = await client.spotifyActivity.getRecentlyPlayed();
    if (!result.rateLimited) {
      setRecentTracks(dedupeRecent(result.items));
    }
  }, [canBrowsePersonalSpotify, client]);

  const fetchAll = useCallback(async () => {
    if (!canBrowsePersonalSpotify) return;
    setLoading(true);
    try {
      const data = await loadActivityBootstrap(client);
      setFavoriteArtists(data.favoriteArtists);
      setRecentTracks(dedupeRecent(data.recentTracks));
      setPlaylists(data.playlists);
      setPlaylistsTotal(data.playlistsTotal);
      offsetRef.current = data.playlists.length;
      playlistTracksRef.current.clear();
    } finally {
      setLoading(false);
    }
  }, [canBrowsePersonalSpotify, client]);

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Poll recently played
  useEffect(() => {
    if (!canBrowsePersonalSpotify) return;
    const pollIfVisible = () => {
      if (document.visibilityState === "visible") {
        void fetchRecent();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchRecent();
      }
    };

    const interval = setInterval(pollIfVisible, RECENT_POLL_MS);
    window.addEventListener("focus", pollIfVisible);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", pollIfVisible);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [canBrowsePersonalSpotify, fetchRecent]);

  const loadMorePlaylists = useCallback(async () => {
    if (!canBrowsePersonalSpotify || offsetRef.current >= playlistsTotal) return;
    const data = await client.spotifyActivity.getPlaylistsPage(
      PLAYLIST_PAGE_SIZE,
      offsetRef.current,
    );
    setPlaylists((prev) => [...prev, ...data.items]);
    setPlaylistsTotal(data.total);
    offsetRef.current += data.items.length;
  }, [canBrowsePersonalSpotify, client, playlistsTotal]);

  const getPlaylistTracks = useCallback(async (playlistId: string) => {
    const cached = playlistTracksRef.current.get(playlistId);
    if (cached) return cached;

    const tracks = await client.spotifyActivity.getPlaylistTracks(playlistId);
    playlistTracksRef.current.set(playlistId, tracks);
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, tracks } : playlist,
      ),
    );
    return tracks ?? [];
  }, [client]);

  return (
    <SpotifyActivityContext.Provider
      value={{
        recentTracks,
        playlists,
        playlistsTotal,
        favoriteArtists,
        loading,
        refresh: fetchAll,
        loadMorePlaylists,
        getPlaylistTracks,
      }}
    >
      {children}
    </SpotifyActivityContext.Provider>
  );
}
