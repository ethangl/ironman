import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  PLAYLIST_PAGE_SIZE,
  spotifyActivityClient,
} from "@/features/spotify/client";
import type { Playlist } from "@/types/spotify-activity";

interface SpotifyPlaylistsContextValue {
  loadMorePlaylists: () => Promise<void>;
  loadPlaylists: (forceRefresh?: boolean) => Promise<void>;
  playlists: Playlist[];
  playlistsLoading: boolean;
  playlistsTotal: number;
}

export const SpotifyPlaylistsContext =
  createContext<SpotifyPlaylistsContextValue | null>(null);

export function useSpotifyPlaylistsState({
  canBrowsePersonalSpotify,
}: {
  canBrowsePersonalSpotify: boolean;
}): SpotifyPlaylistsContextValue {
  const nextPlaylistOffsetRef = useRef(0);
  const appliedPlaylistOffsetsRef = useRef(new Set<number>());
  const loadingPlaylistOffsetsRef = useRef(new Set<number>());
  const playlistsGenerationRef = useRef(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

  const applyPlaylistsPage = useCallback(
    (items: Playlist[], total: number) => {
      setPlaylists(items);
      setPlaylistsTotal(total);
      nextPlaylistOffsetRef.current = items.length;
      appliedPlaylistOffsetsRef.current = new Set(items.length > 0 ? [0] : []);
      loadingPlaylistOffsetsRef.current.clear();
      playlistsGenerationRef.current += 1;
    },
    [],
  );

  const resetPlaylists = useCallback(() => {
    setPlaylists([]);
    setPlaylistsTotal(0);
    setPlaylistsLoading(false);
    nextPlaylistOffsetRef.current = 0;
    appliedPlaylistOffsetsRef.current.clear();
    loadingPlaylistOffsetsRef.current.clear();
    playlistsGenerationRef.current += 1;
  }, []);

  const loadPlaylists = useCallback(
    async (forceRefresh = false) => {
      if (!canBrowsePersonalSpotify) {
        return;
      }

      setPlaylistsLoading(true);

      try {
        const nextPlaylistsPage = forceRefresh
          ? await spotifyActivityClient.getPlaylistsPage(
              PLAYLIST_PAGE_SIZE,
              0,
              true,
            )
          : await spotifyActivityClient.getPlaylistsPage(
              PLAYLIST_PAGE_SIZE,
              0,
            );
        applyPlaylistsPage(nextPlaylistsPage.items, nextPlaylistsPage.total);
      } finally {
        setPlaylistsLoading(false);
      }
    },
    [applyPlaylistsPage, canBrowsePersonalSpotify],
  );

  useEffect(() => {
    if (!canBrowsePersonalSpotify) {
      resetPlaylists();
      return;
    }

    void loadPlaylists();
  }, [canBrowsePersonalSpotify, loadPlaylists, resetPlaylists]);

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
      const data = await spotifyActivityClient.getPlaylistsPage(
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
  }, [canBrowsePersonalSpotify, playlistsTotal]);

  return useMemo(
    () => ({
      loadMorePlaylists,
      loadPlaylists,
      playlists,
      playlistsLoading,
      playlistsTotal,
    }),
    [loadMorePlaylists, loadPlaylists, playlists, playlistsLoading, playlistsTotal],
  );
}

export function useSpotifyPlaylists() {
  const ctx = useContext(SpotifyPlaylistsContext);
  if (!ctx) {
    throw new Error(
      "useSpotifyPlaylists must be used within SpotifyActivityProvider",
    );
  }

  return ctx;
}
