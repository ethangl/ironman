import { api } from "@api";
import type { LastFmArtistMatch } from "./types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";

export async function getLastFmArtist(
  artistName: string,
  musicBrainzId: string | null,
): Promise<LastFmArtistMatch | null> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.lastfm.artistDetails, {
    artistName,
    musicBrainzId,
  });
}
