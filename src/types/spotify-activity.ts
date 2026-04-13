import type { SpotifyPlaylist, SpotifyTrack } from "@/types";

export interface RecentTrack {
  playedAt: string;
  track: SpotifyTrack;
}

export type Playlist = SpotifyPlaylist & {
  tracks?: SpotifyTrack[] | null;
};
