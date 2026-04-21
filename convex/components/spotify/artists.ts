import { v } from "convex/values";

import { action } from "./_generated/server";
import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import {
  isSpotifyAlbum,
  isSpotifyTrack,
  mapAlbumRelease,
  mapArtist,
  mapTrack,
  type SpotifyAlbum,
  type SpotifyApiArtist,
  type SpotifyApiTrack,
} from "./mappers";
import type { SpotifyArtist, SpotifyArtistPageData, SpotifyTrack } from "./types";
import {
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
} from "./validators";

interface SearchResponse {
  tracks?: {
    items?: Array<SpotifyApiTrack | null>;
  };
}

type ArtistResponse = SpotifyApiArtist;

interface ArtistAlbumsResponse {
  items?: Array<SpotifyAlbum | null>;
}

interface TopArtistsResponse {
  items?: SpotifyApiArtist[];
}

interface FollowedArtistsResponse {
  artists?: {
    items?: SpotifyApiArtist[];
  };
}

export interface ArtistPageDataResult {
  page: SpotifyArtistPageData;
  usedReleaseFallback: boolean;
}

function toArtistError(error: unknown) {
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

async function searchArtistTracks(
  token: string,
  artistId: string,
  artistName: string,
  market?: string | null,
): Promise<SpotifyTrack[]> {
  const query = `artist:${artistName}`;
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "10",
    ...(market ? { market } : {}),
  });

  const data = await spotifyFetch<SearchResponse>(
    `/search?${params.toString()}`,
    token,
  );

  const seen = new Set<string>();

  return (data?.tracks?.items ?? [])
    .filter(isSpotifyTrack)
    .filter((track) => track.artists?.some((artist) => artist.id === artistId))
    .sort((left, right) => {
      const leftPrimaryArtist = left.artists?.[0]?.id === artistId ? 1 : 0;
      const rightPrimaryArtist = right.artists?.[0]?.id === artistId ? 1 : 0;
      if (leftPrimaryArtist !== rightPrimaryArtist) {
        return rightPrimaryArtist - leftPrimaryArtist;
      }

      return (right.popularity ?? 0) - (left.popularity ?? 0);
    })
    .filter((track) => {
      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    })
    .slice(0, 10)
    .map(mapTrack);
}

export async function getSpotifyProfileMarket(
  token: string,
): Promise<string | null> {
  const data = await spotifyFetch<{ country?: string }>("/me", token);
  return data?.country ?? null;
}

export async function getTopArtists(
  token: string,
  limit = 20,
): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<TopArtistsResponse>(
    `/me/top/artists?limit=${limit}`,
    token,
  );
  const artists = (data?.items ?? []).map(mapArtist);

  if (process.env.NODE_ENV !== "test") {
    console.info(`[spotify] top artists limit=${limit} items=${artists.length}`);
  }

  return artists;
}

export async function getFavoriteArtists(
  token: string,
  limit = 50,
): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<FollowedArtistsResponse>(
    `/me/following?type=artist&limit=${limit}`,
    token,
  );
  const artists = (data?.artists?.items ?? []).map(mapArtist);

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] followed artists limit=${limit} items=${artists.length}`,
    );
  }

  return artists;
}

async function getArtistReleasesResult(
  token: string,
  artistId: string,
  includeGroups: "album" | "single",
  market?: string | null,
) {
  const releasesQuery = new URLSearchParams({
    include_groups: includeGroups,
    limit: "10",
    ...(market ? { market } : {}),
  }).toString();

  try {
    const data = await spotifyFetch<ArtistAlbumsResponse>(
      `/artists/${artistId}/albums?${releasesQuery}`,
      token,
    );

    return {
      releases: (data?.items ?? [])
        .filter(isSpotifyAlbum)
        .map(mapAlbumRelease)
        .filter((album) => album.id !== ""),
      usedFallback: false,
    };
  } catch (error) {
    if (
      error instanceof SpotifyApiError &&
      error.status !== 401 &&
      error.status !== 403
    ) {
      return {
        releases: [],
        usedFallback: true,
      };
    }

    throw error;
  }
}

export async function getArtistPageDataResult(
  token: string,
  artistId: string,
  market?: string | null,
): Promise<ArtistPageDataResult> {
  const artistData = await spotifyFetch<ArtistResponse>(`/artists/${artistId}`, token);
  if (!artistData) {
    throw new SpotifyApiError(404, `Artist ${artistId} not found`);
  }
  const topTracksData = await searchArtistTracks(
    token,
    artistId,
    artistData.name,
    market,
  );
  const albumsResult = await getArtistReleasesResult(
    token,
    artistId,
    "album",
    market,
  );
  const singlesResult = await getArtistReleasesResult(
    token,
    artistId,
    "single",
    market,
  );

  return {
    page: {
      artist: mapArtist(artistData),
      topTracks: topTracksData,
      albums: albumsResult.releases,
      singles: singlesResult.releases,
    },
    usedReleaseFallback:
      albumsResult.usedFallback || singlesResult.usedFallback,
  };
}

export async function getArtistPageData(
  token: string,
  artistId: string,
  market?: string | null,
): Promise<SpotifyArtistPageData> {
  const result = await getArtistPageDataResult(token, artistId, market);
  return result.page;
}

async function getArtistPageMarket(accessToken: string) {
  try {
    return await getSpotifyProfileMarket(accessToken);
  } catch (error) {
    if (
      error instanceof SpotifyApiError &&
      error.status !== 401 &&
      error.status !== 403
    ) {
      return null;
    }

    throw error;
  }
}

export const artistPage = action({
  args: {
    artistId: v.string(),
    accessToken: v.string(),
    cacheScope: v.optional(v.string()),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (_ctx, args) => {
    try {
      const market = await getArtistPageMarket(args.accessToken);
      const { page } = await getArtistPageDataResult(
        args.accessToken,
        args.artistId,
        market,
      );
      return page;
    } catch (error) {
      if (error instanceof SpotifyApiError && error.status === 404) {
        return null;
      }
      throw toArtistError(error);
    }
  },
});

export const topArtists = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (_ctx, args) => {
    try {
      return await getTopArtists(args.accessToken, args.limit ?? 10);
    } catch {
      return [];
    }
  },
});

export const favoriteArtists = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (_ctx, args) => {
    try {
      return await getFavoriteArtists(args.accessToken, args.limit ?? 50);
    } catch {
      return [];
    }
  },
});
