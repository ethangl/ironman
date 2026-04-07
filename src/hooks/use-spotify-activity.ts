"use client";

import { createContext, useContext } from "react";

export interface RecentTrack {
  playedAt: string;
  track: {
    id: string;
    name: string;
    artist: string;
    albumName: string;
    albumImage: string | null;
    durationMs: number;
  };
}

export interface PlaylistTrack {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumImage: string | null;
  durationMs: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  trackCount: number;
  tracks: PlaylistTrack[];
  owner: string | null;
  public: boolean;
}

interface SpotifyActivityContextValue {
  recentTracks: RecentTrack[];
  playlists: Playlist[];
  playlistsTotal: number;
  loading: boolean;
  refresh: () => void;
  loadMorePlaylists: () => void;
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
