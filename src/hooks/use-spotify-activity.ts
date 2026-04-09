import { createContext, useContext } from "react";

import { SpotifyArtist, SpotifyPlaylist, SpotifyTrack } from "@/types";

export interface RecentTrack {
  playedAt: string;
  track: SpotifyTrack;
}

export type PlaylistTrack = SpotifyTrack;

export type Playlist = SpotifyPlaylist & {
  tracks?: PlaylistTrack[] | null;
};

export type FavoriteArtist = SpotifyArtist;

interface SpotifyActivityContextValue {
  recentTracks: RecentTrack[];
  playlists: Playlist[];
  playlistsTotal: number;
  favoriteArtists: FavoriteArtist[];
  loading: boolean;
  refresh: () => void;
  loadMorePlaylists: () => void;
  getPlaylistTracks: (playlistId: string) => Promise<PlaylistTrack[]>;
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
