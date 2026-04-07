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
    if (res.ok) {
      setRecentTracks(dedupeRecent(await res.json()));
    }
  }, [isAuthenticated]);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [recentRes, playlistRes] = await Promise.all([
        fetch("/api/recently-played"),
        fetch(`/api/playlists?limit=${PLAYLIST_PAGE_SIZE}&offset=0`),
      ]);
      if (recentRes.ok) {
        setRecentTracks(dedupeRecent(await recentRes.json()));
      }
      if (playlistRes.ok) {
        const data = await playlistRes.json();
        setPlaylists(data.items);
        setPlaylistsTotal(data.total);
        offsetRef.current = data.items.length;
      }
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
    const interval = setInterval(fetchRecent, RECENT_POLL_MS);
    return () => clearInterval(interval);
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

  return (
    <SpotifyActivityContext.Provider
      value={{
        recentTracks,
        playlists,
        playlistsTotal,
        loading,
        refresh: fetchAll,
        loadMorePlaylists,
      }}
    >
      {children}
    </SpotifyActivityContext.Provider>
  );
}
