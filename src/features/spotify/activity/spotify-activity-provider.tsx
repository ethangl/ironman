import { useCallback, useEffect, useRef, useState } from "react";

import {
  PLAYLIST_PAGE_SIZE,
  useSpotifyClient,
} from "@/features/spotify/client";
import { useAppCapabilities } from "@/app";
import type { SpotifyArtist } from "@/types";
import type {
  Playlist,
  RecentTrack,
} from "@/types/spotify-activity";
import { SpotifyActivityContext } from "./use-spotify-activity";
import { useSpotifyPlaylistTracks } from "./use-spotify-playlist-tracks";
import { useSpotifyRecentPolling } from "./use-spotify-recent-polling";

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

export function SpotifyActivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useSpotifyClient();
  const { canBrowsePersonalSpotify } = useAppCapabilities();
  const offsetRef = useRef(0);
  const requestIdRef = useRef(0);
  const [recentTracks, setRecentTracksState] = useState<RecentTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
  const [favoriteArtists, setFavoriteArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const { clearPlaylistTracks, getPlaylistTracks } = useSpotifyPlaylistTracks({
    client,
    setPlaylists,
  });

  const resetActivity = useCallback(() => {
    setRecentTracksState([]);
    setPlaylists([]);
    setPlaylistsTotal(0);
    setFavoriteArtists([]);
    offsetRef.current = 0;
  }, []);

  const loadInitialActivity = useCallback(async () => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (!canBrowsePersonalSpotify) {
      clearPlaylistTracks();
      resetActivity();
      setLoading(false);
      return;
    }

    setLoading(true);
    clearPlaylistTracks();

    const [recentResult, playlistsResult, favoriteArtistsResult] =
      await Promise.allSettled([
        client.spotifyActivity.getRecentlyPlayed(),
        client.spotifyActivity.getPlaylistsPage(PLAYLIST_PAGE_SIZE, 0),
        client.spotifyActivity.getFavoriteArtists(),
      ]);

    if (requestIdRef.current !== requestId) {
      return;
    }

    if (recentResult.status === "fulfilled" && !recentResult.value.rateLimited) {
      setRecentTracksState(dedupeRecent(recentResult.value.items));
    } else {
      setRecentTracksState([]);
    }

    if (playlistsResult.status === "fulfilled") {
      setPlaylists(playlistsResult.value.items);
      setPlaylistsTotal(playlistsResult.value.total);
      offsetRef.current = playlistsResult.value.items.length;
    } else {
      setPlaylists([]);
      setPlaylistsTotal(0);
      offsetRef.current = 0;
    }

    if (favoriteArtistsResult.status === "fulfilled") {
      setFavoriteArtists(favoriteArtistsResult.value);
    } else {
      setFavoriteArtists([]);
    }

    setLoading(false);
  }, [canBrowsePersonalSpotify, clearPlaylistTracks, client, resetActivity]);

  useEffect(() => {
    void loadInitialActivity();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadInitialActivity]);

  const fetchRecent = useCallback(async () => {
    if (!canBrowsePersonalSpotify) {
      return;
    }

    const result = await client.spotifyActivity.getRecentlyPlayed();
    if (!result.rateLimited) {
      setRecentTracksState(dedupeRecent(result.items));
    }
  }, [canBrowsePersonalSpotify, client]);

  useSpotifyRecentPolling({
    enabled: canBrowsePersonalSpotify,
    refreshRecent: fetchRecent,
  });

  const refresh = useCallback(() => {
    void loadInitialActivity();
  }, [loadInitialActivity]);

  const loadMorePlaylists = useCallback(async () => {
    if (!canBrowsePersonalSpotify || offsetRef.current >= playlistsTotal) {
      return;
    }

    const requestId = requestIdRef.current;

    const data = await client.spotifyActivity.getPlaylistsPage(
      PLAYLIST_PAGE_SIZE,
      offsetRef.current,
    );

    if (requestIdRef.current !== requestId) {
      return;
    }

    setPlaylists((previous) => [...previous, ...data.items]);
    setPlaylistsTotal(data.total);
    offsetRef.current += data.items.length;
  }, [
    canBrowsePersonalSpotify,
    client,
    playlistsTotal,
    setPlaylists,
    setPlaylistsTotal,
  ]);

  return (
    <SpotifyActivityContext.Provider
      value={{
        recentTracks,
        playlists,
        playlistsTotal,
        favoriteArtists,
        loading,
        refresh,
        loadMorePlaylists,
        getPlaylistTracks,
      }}
    >
      {children}
    </SpotifyActivityContext.Provider>
  );
}
