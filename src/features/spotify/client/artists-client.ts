import { api } from "@api";
import type {
  LastFmArtistMatch,
  MusicBrainzArtistMatch,
  SpotifyArtistPageData,
  SpotifyTrack,
} from "@/types";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

export interface ArtistsClient {
  getAlbumTracks: (albumId: string) => Promise<SpotifyTrack[]>;
  getLastFmArtist: (
    artistName: string,
    musicBrainzId: string | null,
  ) => Promise<LastFmArtistMatch | null>;
  getMusicBrainzArtist: (
    artistId: string,
  ) => Promise<MusicBrainzArtistMatch | null>;
  getSpotifyArtistIdByMusicBrainzArtistId: (
    musicBrainzArtistId: string,
  ) => Promise<string | null>;
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
    getLastFmArtist: async (artistName, musicBrainzId) => {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.lastfm.artistDetails, {
        artistName,
        musicBrainzId,
      });
    },
    getMusicBrainzArtist: async (artistId) => {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.musicbrainz.artistBySpotifyId, {
        spotifyArtistId: artistId,
      });
    },
    getSpotifyArtistIdByMusicBrainzArtistId: async (musicBrainzArtistId) => {
      const client = await getAuthenticatedSpotifyConvexClient();

      return client.action(api.musicbrainz.spotifyArtistIdByMusicBrainzId, {
        musicBrainzArtistId,
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
