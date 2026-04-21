import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const FAVORITE_ARTISTS_DEFAULT_LIMIT = 50;
export const TOP_ARTISTS_DEFAULT_LIMIT = 10;

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

const loadArtistPageRef =
  anyApi["spotify/artists"].loadArtistPage as FunctionReference<
    "action",
    "internal",
    {
      artistId: string;
      cacheScope: string;
    },
    SpotifyArtistPageData | null
  >;

const loadTopArtistsRef =
  anyApi["spotify/artists"].loadTopArtists as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyArtist[]
  >;

const loadFavoriteArtistsRef =
  anyApi["spotify/artists"].loadFavoriteArtists as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyArtist[]
  >;

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
      if (seen.has(track.id)) {
        return false;
      }
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

export const loadArtistPage = internalAction({
  args: {
    artistId: v.string(),
    cacheScope: v.string(),
  },
  returns: v.union(spotifyArtistPageDataValidator, v.null()),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      const market = await getArtistPageMarket(accessToken);
      const { page } = await getArtistPageDataResult(
        accessToken,
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

export const loadTopArtists = internalAction({
  args: {
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await getTopArtists(accessToken, args.limit);
    } catch {
      return [];
    }
  },
});

export const loadFavoriteArtists = internalAction({
  args: {
    limit: v.number(),
    cacheScope: v.string(),
  },
  returns: v.array(spotifyArtistValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await getFavoriteArtists(accessToken, args.limit);
    } catch {
      return [];
    }
  },
});

export const spotifyArtistPageCache = new ActionCache(components.actionCache, {
  action: loadArtistPageRef,
  name: "spotify-artist-page-v1",
  ttl: DAY_IN_MS,
});

export const spotifyTopArtistsCache = new ActionCache(components.actionCache, {
  action: loadTopArtistsRef,
  name: "spotify-top-artists-v1",
  ttl: DAY_IN_MS,
});

export const spotifyFavoriteArtistsCache = new ActionCache(
  components.actionCache,
  {
    action: loadFavoriteArtistsRef,
    name: "spotify-favorite-artists-v1",
    ttl: DAY_IN_MS,
  },
);

export async function clearArtistsCaches(ctx: ActionCtx) {
  await Promise.all([
    spotifyArtistPageCache.removeAllForName(ctx),
    spotifyTopArtistsCache.removeAllForName(ctx),
    spotifyFavoriteArtistsCache.removeAllForName(ctx),
  ]);
}
