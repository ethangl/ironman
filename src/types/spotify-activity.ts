import type { SpotifyArtist, SpotifyPlaylist, SpotifyTrack } from "@/types";

export interface RecentTrack {
  playedAt: string;
  track: SpotifyTrack;
}

export type PlaylistTrack = SpotifyTrack;

export type Playlist = SpotifyPlaylist & {
  tracks?: PlaylistTrack[] | null;
};

export type FavoriteArtist = SpotifyArtist;
