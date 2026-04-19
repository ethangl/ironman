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

const artistRequestsInFlight = new Map<string, Promise<unknown>>();

function runDedupedArtistRequest<TResult>(
  key: string,
  load: () => Promise<TResult>,
): Promise<TResult> {
  const existing = artistRequestsInFlight.get(key);
  if (existing) {
    return existing as Promise<TResult>;
  }

  const request = load().finally(() => {
    if (artistRequestsInFlight.get(key) === request) {
      artistRequestsInFlight.delete(key);
    }
  });
  artistRequestsInFlight.set(key, request);
  return request;
}

export function createConvexSpotifyArtistsClient(): ArtistsClient {
  return {
    getAlbumTracks: async (albumId) =>
      runDedupedArtistRequest(`albumTracks:${albumId}`, async () => {
        const client = await getAuthenticatedSpotifyConvexClient();

        return client.action(api.spotify.albumTracks, {
          albumId,
        });
      }),
    getLastFmArtist: async (artistName, musicBrainzId) => {
      const normalizedArtistName = artistName.trim();
      const normalizedMusicBrainzId = musicBrainzId?.trim() ?? "";

      return runDedupedArtistRequest(
        `lastFm:${normalizedArtistName}:${normalizedMusicBrainzId}`,
        async () => {
          const client = await getAuthenticatedSpotifyConvexClient();

          return client.action(api.lastfm.artistDetails, {
            artistName,
            musicBrainzId,
          });
        },
      );
    },
    getMusicBrainzArtist: async (artistId) =>
      runDedupedArtistRequest(`musicBrainzArtist:${artistId}`, async () => {
        const client = await getAuthenticatedSpotifyConvexClient();

        return client.action(api.musicbrainz.artistBySpotifyId, {
          spotifyArtistId: artistId,
        });
      }),
    getSpotifyArtistIdByMusicBrainzArtistId: async (musicBrainzArtistId) =>
      runDedupedArtistRequest(
        `spotifyArtistIdByMusicBrainzId:${musicBrainzArtistId}`,
        async () => {
          const client = await getAuthenticatedSpotifyConvexClient();

          return client.action(api.musicbrainz.spotifyArtistIdByMusicBrainzId, {
            musicBrainzArtistId,
          });
        },
      ),
    getPageData: async (artistId) =>
      runDedupedArtistRequest(`artistPage:${artistId}`, async () => {
        const client = await getAuthenticatedSpotifyConvexClient();

        return client.action(api.spotify.artistPage, {
          artistId,
        });
      }),
  };
}

export const spotifyArtistsClient = createConvexSpotifyArtistsClient();
