import { useCallback, useEffect, useRef, useState } from "react";

import { useAppCapabilities } from "@/app";
import {
  PLAYLIST_PAGE_SIZE,
  useSpotifyClient,
} from "@/features/spotify/client";
import type { SpotifyArtist } from "@/types";
import type { Playlist, RecentTrack } from "@/types/spotify-activity";
import { SpotifyActivityContext } from "./use-spotify-activity";
import { useSpotifyPlaylistTracks } from "./use-spotify-playlist-tracks";
import { useSpotifyRecentPolling } from "./use-spotify-recent-polling";

const EMPTY_FAVORITE_ARTISTS: SpotifyArtist[] = [];

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
  const nextPlaylistOffsetRef = useRef(0);
  const appliedPlaylistOffsetsRef = useRef(new Set<number>());
  const loadingPlaylistOffsetsRef = useRef(new Set<number>());
  const playlistsGenerationRef = useRef(0);
  const snapshotRequestVersionRef = useRef(0);
  const [recentTracks, setRecentTracksState] = useState<RecentTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
  const [favoriteArtists, setFavoriteArtists] = useState<SpotifyArtist[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(
    canBrowsePersonalSpotify,
  );
  const [snapshotRefreshing, setSnapshotRefreshing] = useState(false);
  const { clearPlaylistTracks, getPlaylistTracks } = useSpotifyPlaylistTracks({
    client,
    setPlaylists,
  });

  const resetActivity = useCallback(() => {
    clearPlaylistTracks();
    setRecentTracksState([]);
    setPlaylists([]);
    setPlaylistsTotal(0);
    setFavoriteArtists([]);
    nextPlaylistOffsetRef.current = 0;
    appliedPlaylistOffsetsRef.current.clear();
    loadingPlaylistOffsetsRef.current.clear();
    playlistsGenerationRef.current += 1;
  }, [clearPlaylistTracks]);

  const loadActivitySnapshot = useCallback(
    async (mode: "load" | "refresh") => {
      if (!canBrowsePersonalSpotify) {
        return;
      }

      const requestVersion = ++snapshotRequestVersionRef.current;
      if (mode === "refresh") {
        setSnapshotRefreshing(true);
      } else {
        setSnapshotLoading(true);
        setSnapshotRefreshing(false);
      }

      try {
        const activitySnapshot =
          await client.spotifyActivity.getActivitySnapshot();
        if (snapshotRequestVersionRef.current !== requestVersion) {
          return;
        }

        clearPlaylistTracks();
        if (!activitySnapshot.recentlyPlayed.rateLimited) {
          setRecentTracksState(
            dedupeRecent(activitySnapshot.recentlyPlayed.items),
          );
        }
        setPlaylists(activitySnapshot.playlistsPage.items);
        setPlaylistsTotal(activitySnapshot.playlistsPage.total);
        setFavoriteArtists(
          activitySnapshot.favoriteArtists ?? EMPTY_FAVORITE_ARTISTS,
        );
        nextPlaylistOffsetRef.current =
          activitySnapshot.playlistsPage.items.length;
        appliedPlaylistOffsetsRef.current = new Set([0]);
        loadingPlaylistOffsetsRef.current.clear();
        playlistsGenerationRef.current += 1;
      } catch {
        if (snapshotRequestVersionRef.current !== requestVersion) {
          return;
        }
      } finally {
        if (snapshotRequestVersionRef.current !== requestVersion) {
          return;
        }
        setSnapshotLoading(false);
        setSnapshotRefreshing(false);
      }
    },
    [canBrowsePersonalSpotify, clearPlaylistTracks, client],
  );

  useEffect(() => {
    if (!canBrowsePersonalSpotify) {
      snapshotRequestVersionRef.current += 1;
      setSnapshotLoading(false);
      setSnapshotRefreshing(false);
      resetActivity();
      return;
    }

    void loadActivitySnapshot("load");
  }, [canBrowsePersonalSpotify, loadActivitySnapshot, resetActivity]);

  const refreshRecent = useCallback(async () => {
    if (!canBrowsePersonalSpotify) {
      return;
    }

    const result = await client.spotifyActivity.getRecentlyPlayed();
    if (!result.rateLimited) {
      setRecentTracksState(dedupeRecent(result.items));
    }
  }, [canBrowsePersonalSpotify, client]);

  useSpotifyRecentPolling({
    enabled: canBrowsePersonalSpotify && !snapshotLoading,
    refreshRecent,
  });

  const refresh = useCallback(() => {
    if (!canBrowsePersonalSpotify) {
      setSnapshotLoading(false);
      setSnapshotRefreshing(false);
      resetActivity();
      return;
    }

    playlistsGenerationRef.current += 1;
    appliedPlaylistOffsetsRef.current.clear();
    void loadActivitySnapshot("refresh");
  }, [canBrowsePersonalSpotify, loadActivitySnapshot, resetActivity]);

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
  const loading = snapshotLoading || snapshotRefreshing;

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
