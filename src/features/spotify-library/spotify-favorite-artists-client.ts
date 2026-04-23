import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import type { FavoriteArtistsPage } from "@/features/spotify-client/types";

export async function getSpotifyFavoriteArtistsPage(
  after?: string,
  limit?: number,
  forceRefresh?: boolean,
): Promise<FavoriteArtistsPage> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.favoriteArtists, {
    after,
    limit,
    forceRefresh,
  });
}
