import { api } from "@api";
import type { SpotifyArtistPageData, SpotifyTrack } from "@/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify/client/spotify-convex-client";

export async function getSpotifyAlbumTracks(
  albumId: string,
): Promise<SpotifyTrack[]> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.albumTracks, {
    albumId,
  });
}

export async function getSpotifyArtistPageData(
  artistId: string,
): Promise<SpotifyArtistPageData | null> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.artistPage, {
    artistId,
  });
}
