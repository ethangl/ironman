import { api } from "@api";
import type { MusicBrainzArtistMatch } from "@/types";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";

export async function getMusicBrainzArtist(
  artistId: string,
): Promise<MusicBrainzArtistMatch | null> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.musicbrainz.artistBySpotifyId, {
    spotifyArtistId: artistId,
  });
}

export async function getSpotifyArtistIdByMusicBrainzArtistId(
  musicBrainzArtistId: string,
): Promise<string | null> {
  const client = await getAuthenticatedSpotifyConvexClient();

  return client.action(api.musicbrainz.spotifyArtistIdByMusicBrainzId, {
    musicBrainzArtistId,
  });
}
