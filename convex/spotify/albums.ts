import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import { spotifyFetch } from "./client";
import { DAY_IN_MS } from "./constants";
import { SpotifyApiError } from "./errors";
import {
  mapAlbumDetails,
  mapTrack,
  type SpotifyAlbum,
  type SpotifyApiTrack,
} from "./mappers";
import type { SpotifyAlbumDetails, SpotifyTrack } from "./types";
import {
  spotifyAlbumDetailsValidator,
  spotifyTrackValidator,
} from "./validators";

interface AlbumDetailsResponse extends SpotifyAlbum {
  tracks?: {
    items?: Array<
      (Omit<SpotifyApiTrack, "album"> & { album?: SpotifyAlbum }) | null
    >;
  };
}

const loadAlbumRef = anyApi["spotify/albums"].loadAlbum as FunctionReference<
  "action",
  "internal",
  {
    albumId: string;
  },
  SpotifyAlbumDetails | null
>;

const loadAlbumTracksRef = anyApi["spotify/albums"]
  .loadAlbumTracks as FunctionReference<
  "action",
  "internal",
  {
    albumId: string;
  },
  SpotifyTrack[]
>;

function toAlbumError(error: unknown, fallback: string) {
  if (!(error instanceof SpotifyApiError)) {
    return new Error(fallback);
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Reconnect Spotify to load album data.");
  }

  if (error.status === 429) {
    return new Error("Spotify is rate limiting album requests right now.");
  }

  return new Error(fallback);
}

async function fetchAlbumDetails(
  token: string,
  albumId: string,
): Promise<AlbumDetailsResponse | null> {
  return await spotifyFetch<AlbumDetailsResponse>(`/albums/${albumId}`, token);
}

export async function getAlbum(
  token: string,
  albumId: string,
): Promise<SpotifyAlbumDetails | null> {
  try {
    const data = await fetchAlbumDetails(token, albumId);

    if (!data?.id) {
      return null;
    }

    return mapAlbumDetails(data);
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getAlbumTracks(
  token: string,
  albumId: string,
): Promise<SpotifyTrack[]> {
  const data = await fetchAlbumDetails(token, albumId);

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
    .filter(
      (track): track is Omit<SpotifyApiTrack, "album"> => !!track && !!track.id,
    )
    .map((track) => mapTrack({ ...track, album }));
}

export const loadAlbum = internalAction({
  args: {
    albumId: v.string(),
  },
  returns: v.union(spotifyAlbumDetailsValidator, v.null()),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await getAlbum(accessToken, args.albumId);
    } catch (error) {
      throw toAlbumError(error, "Could not load album.");
    }
  },
});

export const loadAlbumTracks = internalAction({
  args: {
    albumId: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await getAlbumTracks(accessToken, args.albumId);
    } catch (error) {
      throw toAlbumError(error, "Could not load album tracks.");
    }
  },
});

export const spotifyAlbumCache = new ActionCache(components.actionCache, {
  action: loadAlbumRef,
  name: "spotify-album-v1",
  ttl: DAY_IN_MS,
});

export const spotifyAlbumTracksCache = new ActionCache(components.actionCache, {
  action: loadAlbumTracksRef,
  name: "spotify-album-tracks-v1",
  ttl: DAY_IN_MS,
});

export async function clearAlbumsCaches(ctx: ActionCtx) {
  await Promise.all([
    spotifyAlbumCache.removeAllForName(ctx),
    spotifyAlbumTracksCache.removeAllForName(ctx),
  ]);
}
