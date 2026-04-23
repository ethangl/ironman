import { api } from "@api";
import { RECENTLY_PLAYED_LIMIT } from "@/features/spotify-client";
import type { RecentlyPlayedPageResult } from "@/features/spotify-client/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";

export async function getSpotifyRecentlyPlayedPage(
  before?: number | null,
  limit = RECENTLY_PLAYED_LIMIT,
  forceRefresh = false,
): Promise<RecentlyPlayedPageResult> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.spotify.recentlyPlayed, {
    before: before ?? undefined,
    forceRefresh,
    limit,
  });
}
