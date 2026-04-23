import { api } from "@api";
import type { SpotifyTrack } from "@/features/spotify-client/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";

export async function getSpotifyPlaylistTracks(
  playlistId: string,
): Promise<SpotifyTrack[]> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.playlistTracks, {
    playlistId,
  });
}
