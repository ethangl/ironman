import { useCallback, useEffect, useRef } from "react";

import {
  PLAYLIST_PAGE_SIZE,
  useSpotifyClient,
} from "@/features/spotify/client";
import { useAppAuth, useAppCapabilities } from "@/app";
import { SpotifyActivityContext } from "./use-spotify-activity";
import { useSpotifyActivityBootstrap } from "./use-spotify-activity-bootstrap";
import { useSpotifyFavoriteArtists } from "./use-spotify-favorite-artists";
import { useSpotifyPlaylistTracks } from "./use-spotify-playlist-tracks";
import { useSpotifyRecentPolling } from "./use-spotify-recent-polling";

export function SpotifyActivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useSpotifyClient();
  const { session } = useAppAuth();
  const { canBrowsePersonalSpotify } = useAppCapabilities();
  const sessionUserId = session?.user.id ?? null;
  const offsetRef = useRef(0);
  const {
    recentTracks,
    setRecentTracks,
    playlists,
    setPlaylists,
    playlistsTotal,
    setPlaylistsTotal,
    loading,
    refresh: refreshBootstrap,
    bootstrapVersion,
  } = useSpotifyActivityBootstrap({
    client,
    enabled: canBrowsePersonalSpotify,
    userId: sessionUserId,
  });
  const { data: favoriteArtistsData } = useSpotifyFavoriteArtists({
    enabled: canBrowsePersonalSpotify,
  });
  const { clearPlaylistTracks, getPlaylistTracks } = useSpotifyPlaylistTracks({
    client,
    setPlaylists,
  });
  const favoriteArtists = favoriteArtistsData ?? [];

  useEffect(() => {
    offsetRef.current = playlists.length;
  }, [playlists.length]);

  useEffect(() => {
    clearPlaylistTracks();
  }, [bootstrapVersion, clearPlaylistTracks]);

  const fetchRecent = useCallback(async () => {
    if (!canBrowsePersonalSpotify) {
      return;
    }

    const result = await client.spotifyActivity.getRecentlyPlayed();
    if (!result.rateLimited) {
      setRecentTracks(result.items);
    }
  }, [canBrowsePersonalSpotify, client, setRecentTracks]);

  useSpotifyRecentPolling({
    enabled: canBrowsePersonalSpotify,
    refreshRecent: fetchRecent,
  });

  const refresh = useCallback(async () => {
    clearPlaylistTracks();
    await refreshBootstrap();
  }, [clearPlaylistTracks, refreshBootstrap]);

  const loadMorePlaylists = useCallback(async () => {
    if (!canBrowsePersonalSpotify || offsetRef.current >= playlistsTotal) {
      return;
    }

    const data = await client.spotifyActivity.getPlaylistsPage(
      PLAYLIST_PAGE_SIZE,
      offsetRef.current,
    );

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
