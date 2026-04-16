import { createContext, useContext } from "react";

import type { SpotifyArtist, SpotifyTrack } from "@/types";
import type {
  Playlist,
  RecentTrack,
} from "@/types/spotify-activity";

interface SpotifyActivityContextValue {
  recentTracks: RecentTrack[];
  playlists: Playlist[];
  playlistsTotal: number;
  playlistsLoading: boolean;
  favoriteArtists: SpotifyArtist[];
  favoriteArtistsLoading: boolean;
  loading: boolean;
  appendRecentTrack: (track: SpotifyTrack) => void;
  loadFavoriteArtists: (forceRefresh?: boolean) => Promise<void>;
  loadPlaylists: (forceRefresh?: boolean) => Promise<void>;
  refresh: () => void;
  loadMorePlaylists: () => void;
  getPlaylistTracks: (playlistId: string) => Promise<SpotifyTrack[]>;
}

export const SpotifyActivityContext =
  createContext<SpotifyActivityContextValue | null>(null);

export function useSpotifyActivity() {
  const ctx = useContext(SpotifyActivityContext);
  if (!ctx)
    throw new Error(
      "useSpotifyActivity must be used within SpotifyActivityProvider",
    );
  return ctx;
}
