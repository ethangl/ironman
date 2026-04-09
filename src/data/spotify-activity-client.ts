import {
  getPlaylistTracksById,
  getPlaylistsPage,
  getRecentlyPlayedActivity,
  getTopArtistsActivity,
  type ActivityBootstrap,
  type PlaylistsPage,
  type RecentlyPlayedResult,
} from "@/data/spotify-activity";
import type { PlaylistTrack } from "@/hooks/use-spotify-activity";

export interface SpotifyActivityClient {
  getRecentlyPlayed: () => Promise<RecentlyPlayedResult>;
  getPlaylistsPage: (limit?: number, offset?: number) => Promise<PlaylistsPage>;
  getPlaylistTracks: (playlistId: string) => Promise<PlaylistTrack[]>;
  getTopArtists: (limit?: number) => ReturnType<typeof getTopArtistsActivity>;
  loadBootstrap: () => Promise<ActivityBootstrap>;
}

async function loadSpotifyActivityBootstrap(): Promise<ActivityBootstrap> {
  const [recentResult, playlistData, artistData] = await Promise.all([
    getRecentlyPlayedActivity(),
    getPlaylistsPage(),
    getTopArtistsActivity(),
  ]);

  return {
    favoriteArtists: artistData,
    playlists: playlistData.items,
    playlistsTotal: playlistData.total,
    recentTracks: recentResult.items,
  };
}

export function createSpotifyActivityClient(): SpotifyActivityClient {
  return {
    getRecentlyPlayed: getRecentlyPlayedActivity,
    getPlaylistsPage,
    getPlaylistTracks: getPlaylistTracksById,
    getTopArtists: getTopArtistsActivity,
    loadBootstrap: loadSpotifyActivityBootstrap,
  };
}

export const spotifyActivityClient = createSpotifyActivityClient();
