import { v } from "convex/values";

import { action } from "./_generated/server";
import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import { mapTrack, type SpotifyAlbum, type SpotifyApiTrack } from "./mappers";
import type { SpotifyTrack } from "./types";
import { spotifyTrackValidator } from "./validators";

interface AlbumDetailsResponse extends SpotifyAlbum {
  tracks?: {
    items?: Array<(Omit<SpotifyApiTrack, "album"> & { album?: SpotifyAlbum }) | null>;
  };
}

export async function getAlbumTracks(
  token: string,
  albumId: string,
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<AlbumDetailsResponse>(`/albums/${albumId}`, token);

  if (!data?.tracks?.items) {
    return [];
  }

  const album: SpotifyAlbum = {
    id: data.id,
    name: data.name,
    album_type: data.album_type,
    images: data.images,
    release_date: data.release_date,
    total_tracks: data.total_tracks,
    artists: data.artists,
  };

  return data.tracks.items
    .filter((track): track is Omit<SpotifyApiTrack, "album"> => !!track && !!track.id)
    .map((track) => mapTrack({ ...track, album }));
}

export const albumTracks = action({
  args: {
    albumId: v.string(),
    accessToken: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (_ctx, args) => {
    try {
      return await getAlbumTracks(args.accessToken, args.albumId);
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        if (error.status === 401 || error.status === 403) {
          throw new Error("Reconnect Spotify to load album tracks.");
        }

        if (error.status === 429) {
          throw new Error("Spotify is rate limiting album requests right now.");
        }
      }

      throw new Error("Could not load album tracks.");
    }
  },
});
