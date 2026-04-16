import { api } from "@api";
import type { SpotifyArtistPageData, SpotifyTrack } from "@/types";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

export interface ArtistsClient {
  getAlbumTracks: (albumId: string) => Promise<SpotifyTrack[]>;
  getPageData: (artistId: string) => Promise<SpotifyArtistPageData | null>;
}

export function createConvexSpotifyArtistsClient(): ArtistsClient {
  return {
    getAlbumTracks: async (albumId) => {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.albumTracks, {
        albumId,
      });
    },
    getPageData: async (artistId) => {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.spotify.artistPage, {
        artistId,
      });
    },
  };
}

export const spotifyArtistsClient = createConvexSpotifyArtistsClient();
