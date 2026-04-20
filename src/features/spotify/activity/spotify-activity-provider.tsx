import { useCallback, useEffect, useRef, useState } from "react";

import { useAppCapabilities } from "@/app";
import {
  PLAYLIST_PAGE_SIZE,
  RECENTLY_PLAYED_LIMIT,
  useSpotifyClient,
} from "@/features/spotify/client";
import type { SpotifyArtist, SpotifyTrack } from "@/types";
import type { Playlist, RecentTrack } from "@/types/spotify-activity";
import { SpotifyActivityContext } from "./use-spotify-activity";
import { useSpotifyPlaylistTracks } from "./use-spotify-playlist-tracks";
const FAVORITE_ARTISTS_LIMIT = 50;

function dedupeRecent(raw: RecentTrack[]) {
  const seen = new Set<string>();
  const deduped: RecentTrack[] = [];

  for (const item of raw) {
    if (seen.has(item.track.id)) {
      continue;
    }

    seen.add(item.track.id);
    deduped.push(item);

    if (deduped.length >= RECENTLY_PLAYED_LIMIT) {
      break;
    }
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
  const nextPlaylistOffsetRef = useRef(0);
  const appliedPlaylistOffsetsRef = useRef(new Set<number>());
  const loadingPlaylistOffsetsRef = useRef(new Set<number>());
  const playlistsGenerationRef = useRef(0);
  const recentlyPlayedRequestVersionRef = useRef(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [recentTracks, setRecentTracksState] = useState<RecentTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [favoriteArtists, setFavoriteArtists] = useState<SpotifyArtist[]>([]);
  const [favoriteArtistsLoading, setFavoriteArtistsLoading] = useState(false);
  const [recentTracksLoading, setRecentTracksLoading] = useState(
    canBrowsePersonalSpotify,
  );
  const [recentTracksRefreshing, setRecentTracksRefreshing] = useState(false);
  const { clearPlaylistTracks, getPlaylistTracks } = useSpotifyPlaylistTracks({
    client,
    setPlaylists,
  });
  const appendRecentTrack = useCallback((track: SpotifyTrack) => {
    const nextItem: RecentTrack = {
      playedAt: new Date().toISOString(),
      track,
    };
    setRecentTracksState((current) => dedupeRecent([nextItem, ...current]));
  }, []);

  const applyPlaylistsPage = useCallback(
    (items: Playlist[], total: number) => {
      clearPlaylistTracks();
      setPlaylists(items);
      setPlaylistsTotal(total);
      nextPlaylistOffsetRef.current = items.length;
      appliedPlaylistOffsetsRef.current = new Set(items.length > 0 ? [0] : []);
      loadingPlaylistOffsetsRef.current.clear();
      playlistsGenerationRef.current += 1;
    },
    [clearPlaylistTracks],
  );

  const resetActivity = useCallback(() => {
    clearPlaylistTracks();
    setRecentTracksState([]);
    setPlaylists([]);
    setPlaylistsTotal(0);
    setPlaylistsLoading(false);
    setFavoriteArtists([]);
    setFavoriteArtistsLoading(false);
    nextPlaylistOffsetRef.current = 0;
    appliedPlaylistOffsetsRef.current.clear();
    loadingPlaylistOffsetsRef.current.clear();
    playlistsGenerationRef.current += 1;
  }, [clearPlaylistTracks]);

  const loadRecentlyPlayed = useCallback(
    async (mode: "load" | "refresh") => {
      if (!canBrowsePersonalSpotify) {
        return;
      }

      const requestVersion = ++recentlyPlayedRequestVersionRef.current;
      if (mode === "refresh") {
        setRecentTracksRefreshing(true);
      } else {
        setRecentTracksLoading(true);
        setRecentTracksRefreshing(false);
      }

      try {
        const recentlyPlayed = await client.spotifyActivity.getRecentlyPlayed();
        if (recentlyPlayedRequestVersionRef.current !== requestVersion) {
          return;
        }

        if (!recentlyPlayed.rateLimited) {
          setRecentTracksState(dedupeRecent(recentlyPlayed.items));
        }
      } catch {
        if (recentlyPlayedRequestVersionRef.current !== requestVersion) {
          return;
        }
      } finally {
        if (recentlyPlayedRequestVersionRef.current !== requestVersion) {
          return;
        }
        setRecentTracksLoading(false);
        setRecentTracksRefreshing(false);
      }
    },
    [canBrowsePersonalSpotify, client],
  );

  useEffect(() => {
    if (!canBrowsePersonalSpotify) {
      recentlyPlayedRequestVersionRef.current += 1;
      setRecentTracksLoading(false);
      setRecentTracksRefreshing(false);
      resetActivity();
      return;
    }

    void loadRecentlyPlayed("load");
  }, [canBrowsePersonalSpotify, loadRecentlyPlayed, resetActivity]);

  const loadPlaylists = useCallback(
    async (forceRefresh = false) => {
      if (!canBrowsePersonalSpotify) {
        return;
      }

      setPlaylistsLoading(true);

      try {
        const nextPlaylistsPage = forceRefresh
          ? await client.spotifyActivity.getPlaylistsPage(
              PLAYLIST_PAGE_SIZE,
              0,
              true,
            )
          : await client.spotifyActivity.getPlaylistsPage(
              PLAYLIST_PAGE_SIZE,
              0,
            );
        applyPlaylistsPage(nextPlaylistsPage.items, nextPlaylistsPage.total);
      } finally {
        setPlaylistsLoading(false);
      }
    },
    [applyPlaylistsPage, canBrowsePersonalSpotify, client],
  );

  const loadFavoriteArtists = useCallback(
    async (forceRefresh = false) => {
      if (!canBrowsePersonalSpotify) {
        return;
      }

      setFavoriteArtistsLoading(true);

      try {
        const nextFavoriteArtists = forceRefresh
          ? await client.spotifyActivity.getFavoriteArtists(
              FAVORITE_ARTISTS_LIMIT,
              true,
            )
          : await client.spotifyActivity.getFavoriteArtists(
              FAVORITE_ARTISTS_LIMIT,
            );
        setFavoriteArtists(nextFavoriteArtists);
      } finally {
        setFavoriteArtistsLoading(false);
      }
    },
    [canBrowsePersonalSpotify, client],
  );

  useEffect(() => {
    if (!canBrowsePersonalSpotify) {
      setPlaylists([]);
      setPlaylistsTotal(0);
      setPlaylistsLoading(false);
      setFavoriteArtists([]);
      setFavoriteArtistsLoading(false);
      return;
    }

    void loadPlaylists();
    void loadFavoriteArtists();
  }, [canBrowsePersonalSpotify, loadFavoriteArtists, loadPlaylists]);

  const refresh = useCallback(() => {
    if (!canBrowsePersonalSpotify) {
      setRecentTracksLoading(false);
      setRecentTracksRefreshing(false);
      resetActivity();
      return;
    }
    void loadRecentlyPlayed("refresh");
  }, [canBrowsePersonalSpotify, loadRecentlyPlayed, resetActivity]);

  const loadMorePlaylists = useCallback(async () => {
    const requestedOffset = nextPlaylistOffsetRef.current;
    if (
      !canBrowsePersonalSpotify ||
      requestedOffset >= playlistsTotal ||
      loadingPlaylistOffsetsRef.current.has(requestedOffset)
    ) {
      return;
    }

    const generation = playlistsGenerationRef.current;
    loadingPlaylistOffsetsRef.current.add(requestedOffset);

    try {
      const data = await client.spotifyActivity.getPlaylistsPage(
        PLAYLIST_PAGE_SIZE,
        requestedOffset,
      );

      if (
        generation !== playlistsGenerationRef.current ||
        appliedPlaylistOffsetsRef.current.has(requestedOffset)
      ) {
        return;
      }

      appliedPlaylistOffsetsRef.current.add(requestedOffset);
      setPlaylists((previous) => [...previous, ...data.items]);
      setPlaylistsTotal(data.total);
      nextPlaylistOffsetRef.current = requestedOffset + data.items.length;
    } finally {
      loadingPlaylistOffsetsRef.current.delete(requestedOffset);
    }
  }, [
    canBrowsePersonalSpotify,
    client,
    playlistsTotal,
    setPlaylists,
    setPlaylistsTotal,
  ]);
  const loading = recentTracksLoading || recentTracksRefreshing;

  return (
    <SpotifyActivityContext.Provider
      value={{
        isExpanded,
        recentTracks,
        playlists,
        playlistsTotal,
        favoriteArtists,
        favoriteArtistsLoading,
        loading,
        playlistsLoading,
        appendRecentTrack,
        loadFavoriteArtists,
        loadPlaylists,
        refresh,
        loadMorePlaylists,
        getPlaylistTracks,
        setIsExpanded,
      }}
    >
      {children}
    </SpotifyActivityContext.Provider>
  );
}
