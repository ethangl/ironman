import { api } from "@api";
import type {
  SpotifyAlbumRelease,
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
  SpotifyPage,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";

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

export async function getSpotifyArtistReleasesPage(
  artistId: string,
  includeGroups: SpotifyArtistReleaseGroup,
  offset: number,
  limit?: number,
): Promise<SpotifyPage<SpotifyAlbumRelease>> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.artistReleasesPage, {
    artistId,
    includeGroups,
    offset,
    limit,
  });
}
