import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import type {
  SpotifyPlaylist,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { api } from "@api";

export async function getSpotifyPlaylist(
  playlistId: string,
): Promise<SpotifyPlaylist | null> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.playlist, {
    playlistId,
  });
}

export async function getSpotifyPlaylistTracks(
  playlistId: string,
): Promise<SpotifyTrack[]> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.playlistTracks, {
    playlistId,
  });
}
