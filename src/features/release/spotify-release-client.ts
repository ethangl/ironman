import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import type {
  SpotifyAlbumDetails,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { api } from "@api";

export async function getSpotifyAlbumTracks(
  albumId: string,
): Promise<SpotifyTrack[]> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.albumTracks, {
    albumId,
  });
}

export async function getSpotifyReleasePageData(
  releaseId: string,
): Promise<SpotifyAlbumDetails | null> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.album, {
    albumId: releaseId,
  });
}
