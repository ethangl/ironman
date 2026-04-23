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
  isSpotifyTrack,
  mapPlaylist,
  mapTrack,
  type SpotifyApiPlaylist,
  type SpotifyApiTrack,
} from "./mappers";
import {
  createSpotifyPage,
  type SpotifyOffsetPagingResponse,
} from "./pagination";
import type {
  SpotifyPlaylist,
  SpotifyPlaylistsPage,
  SpotifyTrack,
} from "./types";
import {
  spotifyPlaylistValidator,
  spotifyPlaylistsPageValidator,
  spotifyTrackValidator,
} from "./validators";

type PlaylistSummaryItem = {
  id: string;
  name: string;
  description: string | null;
  images?: { url: string }[];
  items?: { total?: number };
  tracks?: { total?: number };
  owner?: { display_name?: string | null };
  public: boolean;
};

type PlaylistSummaryResponse = SpotifyOffsetPagingResponse<PlaylistSummaryItem>;

interface PlaylistTracksResponse {
  items?: {
    track?: SpotifyApiTrack | null;
    item?: SpotifyApiTrack | null;
  }[];
}

const loadPlaylistsPageRef = anyApi["spotify/playlists"]
  .loadPlaylistsPage as FunctionReference<
  "action",
  "internal",
  {
    limit: number;
    offset: number;
    cacheScope: string;
  },
  SpotifyPlaylistsPage
>;

const loadPlaylistRef = anyApi["spotify/playlists"]
  .loadPlaylist as FunctionReference<
  "action",
  "internal",
  {
    playlistId: string;
    cacheScope: string;
  },
  SpotifyPlaylist | null
>;

const loadPlaylistTracksRef = anyApi["spotify/playlists"]
  .loadPlaylistTracks as FunctionReference<
  "action",
  "internal",
  {
    playlistId: string;
    cacheScope: string;
  },
  SpotifyTrack[]
>;

function toPlaylistsError(error: unknown, fallback: string) {
  if (!(error instanceof SpotifyApiError)) {
    return new Error(fallback);
  }

  if (error.status === 401 || error.status === 403) {
    return new Error("Reconnect Spotify to load your listening activity.");
  }

  if (error.status === 429) {
    return new Error("Spotify is rate limiting activity requests right now.");
  }

  return new Error(fallback);
}

export async function getUserPlaylists(
  token: string,
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET,
): Promise<SpotifyPlaylistsPage> {
  const data = await spotifyFetch<PlaylistSummaryResponse>(
    `/me/playlists?limit=${limit}&offset=${offset}`,
    token,
  );
  const items = (data?.items ?? [])
    .filter((playlist): playlist is PlaylistSummaryItem => playlist !== null)
    .map((playlist) => ({
      ...mapPlaylist(playlist as SpotifyApiPlaylist),
      trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
    }));

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] playlists summary limit=${limit} offset=${offset} items=${items.length} total=${data?.total ?? 0}`,
    );
  }

  return createSpotifyPage(data, items, limit, offset);
}

export async function getPlaylist(
  token: string,
  playlistId: string,
): Promise<SpotifyPlaylist | null> {
  try {
    const playlist = await spotifyFetch<SpotifyApiPlaylist>(
      `/playlists/${playlistId}?fields=id,name,description,images,owner(display_name),public,tracks(total)`,
      token,
    );

    if (!playlist?.id) {
      return null;
    }

    return mapPlaylist(playlist);
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getPlaylistTracks(
  token: string,
  playlistId: string,
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<PlaylistTracksResponse>(
    `/playlists/${playlistId}/items?limit=100`,
    token,
  );
  if (!data?.items) {
    return [];
  }

  const tracks = data.items
    .map((entry) => entry.track ?? entry.item)
    .filter(isSpotifyTrack)
    .map(mapTrack);

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] playlist tracks playlist_id=${playlistId} items=${tracks.length}`,
    );
  }

  return tracks;
}

export const loadPlaylistsPage = internalAction({
  args: {
    limit: v.number(),
    offset: v.number(),
    cacheScope: v.string(),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await getUserPlaylists(accessToken, args.limit, args.offset);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          `[spotify] playlists summary failed limit=${args.limit} offset=${args.offset}`,
          error,
        );
      }

      throw toPlaylistsError(error, "Could not load playlists.");
    }
  },
});

export const loadPlaylist = internalAction({
  args: {
    playlistId: v.string(),
    cacheScope: v.string(),
  },
  returns: v.union(spotifyPlaylistValidator, v.null()),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await getPlaylist(accessToken, args.playlistId);
    } catch (error) {
      throw toPlaylistsError(error, "Could not load playlist.");
    }
  },
});

export const loadPlaylistTracks = internalAction({
  args: {
    playlistId: v.string(),
    cacheScope: v.string(),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (ctx, args) => {
    const accessToken = await requireSpotifyAccessToken(ctx);

    try {
      return await getPlaylistTracks(accessToken, args.playlistId);
    } catch (error) {
      throw toPlaylistsError(error, "Could not load playlist tracks.");
    }
  },
});

export const spotifyPlaylistsPageCache = new ActionCache(
  components.actionCache,
  {
    action: loadPlaylistsPageRef,
    name: "spotify-playlists-page-v2",
    ttl: DAY_IN_MS,
  },
);

export const spotifyPlaylistCache = new ActionCache(components.actionCache, {
  action: loadPlaylistRef,
  name: "spotify-playlist-v1",
  ttl: DAY_IN_MS,
});

export const spotifyPlaylistTracksCache = new ActionCache(
  components.actionCache,
  {
    action: loadPlaylistTracksRef,
    name: "spotify-playlist-tracks-v1",
    ttl: DAY_IN_MS,
  },
);

export async function clearPlaylistsCaches(ctx: ActionCtx) {
  await Promise.all([
    spotifyPlaylistsPageCache.removeAllForName(ctx),
    spotifyPlaylistCache.removeAllForName(ctx),
    spotifyPlaylistTracksCache.removeAllForName(ctx),
  ]);
}
