"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  Playlist,
  RecentTrack,
  SpotifyActivityContext,
} from "@/hooks/use-spotify-activity";
import { useSession } from "@/lib/auth-client";

const PLAYLIST_PAGE_SIZE = 50;
const RECENT_POLL_MS = 30_000;
const ACTIVITY_BOOTSTRAP_TTL_MS = 10_000;

type ActivityBootstrap = {
  playlists: Playlist[];
  playlistsTotal: number;
  recentTracks: RecentTrack[];
};

let activityBootstrapCache: ActivityBootstrap | null = null;
let activityBootstrapExpiresAt = 0;
let activityBootstrapInFlight: Promise<ActivityBootstrap> | null = null;

async function loadActivityBootstrap(): Promise<ActivityBootstrap> {
  const now = Date.now();
  if (activityBootstrapCache && activityBootstrapExpiresAt > now) {
    return activityBootstrapCache;
  }

  if (activityBootstrapInFlight) {
    return activityBootstrapInFlight;
  }

  activityBootstrapInFlight = Promise.all([
    fetch("/api/recently-played"),
    fetch(`/api/playlists?limit=${PLAYLIST_PAGE_SIZE}&offset=0`),
  ])
    .then(async ([recentRes, playlistRes]) => {
      const [recentTracks, playlistData] = await Promise.all([
        recentRes.ok && recentRes.headers.get("x-spotify-rate-limited") !== "1"
          ? recentRes.json()
          : Promise.resolve(activityBootstrapCache?.recentTracks ?? []),
        playlistRes.ok
          ? playlistRes.json()
          : Promise.resolve({
              items: activityBootstrapCache?.playlists ?? [],
              total: activityBootstrapCache?.playlistsTotal ?? 0,
            }),
      ]);

      const bootstrap = {
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
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
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
    if (!isAuthenticated) return;
    const res = await fetch("/api/recently-played");
    if (res.ok && res.headers.get("x-spotify-rate-limited") !== "1") {
      setRecentTracks(dedupeRecent(await res.json()));
    }
  }, [isAuthenticated]);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await loadActivityBootstrap();
      setRecentTracks(dedupeRecent(data.recentTracks));
      setPlaylists(data.playlists);
      setPlaylistsTotal(data.playlistsTotal);
      offsetRef.current = data.playlists.length;
      playlistTracksRef.current.clear();
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Poll recently played
  useEffect(() => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated, fetchRecent]);

  const loadMorePlaylists = useCallback(async () => {
    if (!isAuthenticated || offsetRef.current >= playlistsTotal) return;
    const res = await fetch(
      `/api/playlists?limit=${PLAYLIST_PAGE_SIZE}&offset=${offsetRef.current}`,
    );
    if (res.ok) {
      const data = await res.json();
      setPlaylists((prev) => [...prev, ...data.items]);
      setPlaylistsTotal(data.total);
      offsetRef.current += data.items.length;
    }
  }, [isAuthenticated, playlistsTotal]);

  const getPlaylistTracks = useCallback(
    async (playlistId: string) => {
      const cached = playlistTracksRef.current.get(playlistId);
      if (cached) return cached;

      const res = await fetch(`/api/playlists/${playlistId}`);
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Could not load playlist tracks." }));
        throw new Error(data.error ?? "Could not load playlist tracks.");
      }

      const data = await res.json();
      const tracks = data.items as Playlist["tracks"];
      playlistTracksRef.current.set(playlistId, tracks);
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, tracks } : playlist,
        ),
      );
      return tracks ?? [];
    },
    [],
  );

  return (
    <SpotifyActivityContext.Provider
      value={{
        recentTracks,
        playlists,
        playlistsTotal,
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
