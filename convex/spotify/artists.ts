import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { type ActionCtx, internalAction } from "../_generated/server";
import { requireSpotifyAccessToken } from "../spotifySession";
import { spotifyFetch } from "./client";
import { DAY_IN_MS, DEFAULT_LIMIT, DEFAULT_OFFSET } from "./constants";
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
import type {
  SpotifyAlbumRelease,
  SpotifyArtist,
  SpotifyArtistPageData,
  SpotifyArtistReleaseGroup,
  SpotifyPage,
  SpotifyTrack,
} from "./types";
import {
  spotifyAlbumReleasePageValidator,
  spotifyArtistPageDataValidator,
  spotifyArtistValidator,
} from "./validators";

interface SearchResponse {
  tracks?: {
    items?: Array<SpotifyApiTrack | null>;
  };
}

type ArtistResponse = SpotifyApiArtist;

interface SpotifyPagingResponse<TItem> {
  items?: Array<TItem | null>;
  limit?: number;
  next?: string | null;
  offset?: number;
  previous?: string | null;
  total?: number;
}

type ArtistAlbumsResponse = SpotifyPagingResponse<SpotifyAlbum>;

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

const loadArtistPageRef = anyApi["spotify/artists"]
  .loadArtistPage as FunctionReference<
  "action",
  "internal",
  {
    artistId: string;
    cacheScope: string;
  },
  SpotifyArtistPageData | null
>;

const loadArtistReleasesPageRef = anyApi["spotify/artists"]
  .loadArtistReleasesPage as FunctionReference<
  "action",
  "internal",
  {
    artistId: string;
    includeGroups: SpotifyArtistReleaseGroup;
    limit: number;
    offset: number;
    cacheScope: string;
  },
  SpotifyPage<SpotifyAlbumRelease>
>;

const loadTopArtistsRef = anyApi["spotify/artists"]
  .loadTopArtists as FunctionReference<
  "action",
  "internal",
  {
    limit: number;
    cacheScope: string;
  },
  SpotifyArtist[]
>;

const loadFavoriteArtistsRef = anyApi["spotify/artists"]
  .loadFavoriteArtists as FunctionReference<
  "action",
  "internal",
  {
    limit: number;
    cacheScope: string;
  },
  SpotifyArtist[]
>;

function toArtistRequestError(error: unknown, fallback: string) {
  if (!(error instanceof SpotifyApiError)) {
    return new Error(fallback);
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Reconnect Spotify to load artists.");
  }

  if (error.status === 429) {
    return new Error("Spotify is rate limiting artist requests right now.");
  }

  return new Error(fallback);
}

function getSpotifyNextOffset(next: string | null | undefined) {
  if (!next) {
    return null;
  }

  try {
    const value = new URL(next).searchParams.get("offset");
    if (value === null) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function createSpotifyPage<TItem>(
  response: SpotifyPagingResponse<unknown> | null | undefined,
  items: TItem[],
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET,
): SpotifyPage<TItem> {
  const normalizedLimit = response?.limit ?? limit;
  const normalizedOffset = response?.offset ?? offset;
  const total = response?.total ?? normalizedOffset + items.length;
  const nextOffset =
    getSpotifyNextOffset(response?.next) ??
    (response?.next ? normalizedOffset + items.length : null);
  const hasMore =
    nextOffset !== null || total > normalizedOffset + items.length;

  return {
    items,
    offset: normalizedOffset,
    limit: normalizedLimit,
    total,
    nextOffset:
      nextOffset ?? (hasMore ? normalizedOffset + items.length : null),
    hasMore,
  };
}

function createEmptySpotifyPage<TItem>(
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET,
): SpotifyPage<TItem> {
  return {
    items: [],
    offset,
    limit,
    total: 0,
    nextOffset: null,
    hasMore: false,
  };
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
    console.info(
      `[spotify] top artists limit=${limit} items=${artists.length}`,
    );
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

export async function getArtistReleasesPage(
  token: string,
  artistId: string,
  includeGroups: SpotifyArtistReleaseGroup,
  options: {
    limit?: number;
    offset?: number;
    market?: string | null;
  } = {},
): Promise<SpotifyPage<SpotifyAlbumRelease>> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const offset = options.offset ?? DEFAULT_OFFSET;
  const releasesQuery = new URLSearchParams({
    include_groups: includeGroups,
    limit: String(limit),
    offset: String(offset),
    ...(options.market ? { market: options.market } : {}),
  }).toString();

  const data = await spotifyFetch<ArtistAlbumsResponse>(
    `/artists/${artistId}/albums?${releasesQuery}`,
    token,
  );

  const items = (data?.items ?? [])
    .filter(isSpotifyAlbum)
    .map(mapAlbumRelease)
    .filter((album) => album.id !== "");

  return createSpotifyPage(data, items, limit, offset);
}

async function getArtistReleasesResult(
  token: string,
  artistId: string,
  includeGroups: SpotifyArtistReleaseGroup,
  market?: string | null,
) {
  try {
    return {
      page: await getArtistReleasesPage(token, artistId, includeGroups, {
        market,
      }),
      usedFallback: false,
    };
  } catch (error) {
    if (
      error instanceof SpotifyApiError &&
      error.status !== 401 &&
      error.status !== 403
    ) {
      return {
        page: createEmptySpotifyPage<SpotifyAlbumRelease>(),
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
  const artistData = await spotifyFetch<ArtistResponse>(
    `/artists/${artistId}`,
    token,
  );
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
      albums: albumsResult.page,
      singles: singlesResult.page,
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
      throw toArtistRequestError(error, "Could not load artist right now.");
    }
  },
});

export const loadArtistReleasesPage = internalAction({
  args: {
    artistId: v.string(),
    includeGroups: v.union(v.literal("album"), v.literal("single")),
    limit: v.number(),
    offset: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyAlbumReleasePageValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      const market = await getArtistPageMarket(accessToken);
      return await getArtistReleasesPage(
        accessToken,
        args.artistId,
        args.includeGroups,
        {
          market,
          limit: args.limit,
          offset: args.offset,
        },
      );
    } catch (error) {
      throw toArtistRequestError(
        error,
        "Could not load artist releases right now.",
      );
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
  name: "spotify-artist-page-v2",
  ttl: DAY_IN_MS,
});

export const spotifyArtistReleasesPageCache = new ActionCache(
  components.actionCache,
  {
    action: loadArtistReleasesPageRef,
    name: "spotify-artist-releases-page-v1",
    ttl: DAY_IN_MS,
  },
);

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
    spotifyArtistReleasesPageCache.removeAllForName(ctx),
    spotifyTopArtistsCache.removeAllForName(ctx),
    spotifyFavoriteArtistsCache.removeAllForName(ctx),
  ]);
}
