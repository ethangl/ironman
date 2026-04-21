import { v } from "convex/values";

import { action } from "./_generated/server";
import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import {
  isSpotifyArtist,
  isSpotifyPlaylist,
  isSpotifyTrack,
  mapArtist,
  mapPlaylist,
  mapTrack,
  type SpotifyApiArtist,
  type SpotifyApiPlaylist,
  type SpotifyApiTrack,
} from "./mappers";
import type { SpotifySearchResults, SpotifyTrack } from "./types";
import {
  spotifySearchResultsValidator,
  spotifyTrackValidator,
} from "./validators";

interface SearchResponse {
  tracks?: {
    items?: Array<SpotifyApiTrack | null>;
  };
  artists?: {
    items?: Array<SpotifyApiArtist | null>;
  };
  playlists?: {
    items?: Array<SpotifyApiPlaylist | null>;
  };
}

function toSearchError(error: unknown) {
  if (!(error instanceof SpotifyApiError)) {
    return new Error("Could not search Spotify right now.");
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Reconnect Spotify to search.");
  }

  if (error.status === 429) {
    return new Error("Spotify is rate limiting search right now.");
  }

  return new Error("Could not search Spotify right now.");
}

export async function searchTracksByName(
  query: string,
  token: string,
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    token,
  );

  return (data?.tracks?.items ?? []).filter(isSpotifyTrack).map(mapTrack);
}

export async function searchSpotify(
  query: string,
  token: string,
): Promise<SpotifySearchResults> {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track,artist,playlist&limit=6`,
    token,
  );

  return {
    tracks: (data?.tracks?.items ?? []).filter(isSpotifyTrack).map(mapTrack),
    artists: (data?.artists?.items ?? [])
      .filter(isSpotifyArtist)
      .map(mapArtist),
    playlists: (data?.playlists?.items ?? [])
      .filter(isSpotifyPlaylist)
      .map(mapPlaylist),
  };
}

export const searchResults = action({
  args: {
    query: v.string(),
    accessToken: v.string(),
  },
  returns: spotifySearchResultsValidator,
  handler: async (_ctx, args) => {
    try {
      return await searchSpotify(args.query, args.accessToken);
    } catch (error) {
      throw toSearchError(error);
    }
  },
});

export const searchTracks = action({
  args: {
    query: v.string(),
    accessToken: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (_ctx, args) => {
    try {
      return await searchTracksByName(args.query, args.accessToken);
    } catch (error) {
      throw toSearchError(error);
    }
  },
});
