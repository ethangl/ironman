import { v } from "convex/values";

import { action } from "./_generated/server";
import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import {
  isSpotifyTrack,
  mapPlaylist,
  mapTrack,
  type SpotifyApiPlaylist,
  type SpotifyApiTrack,
} from "./mappers";
import type { SpotifyPlaylistsPage, SpotifyTrack } from "./types";
import {
  spotifyPlaylistsPageValidator,
  spotifyTrackValidator,
} from "./validators";

interface PlaylistSummaryResponse {
  items?: {
    id: string;
    name: string;
    description: string | null;
    images?: { url: string }[];
    items?: { total?: number };
    tracks?: { total?: number };
    owner?: { display_name?: string | null };
    public: boolean;
  }[];
  total: number;
}

interface PlaylistTracksResponse {
  items?: {
    track?: SpotifyApiTrack | null;
    item?: SpotifyApiTrack | null;
  }[];
}

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
  limit = 50,
  offset = 0,
): Promise<SpotifyPlaylistsPage> {
  const data = await spotifyFetch<PlaylistSummaryResponse>(
    `/me/playlists?limit=${limit}&offset=${offset}`,
    token,
  );
  if (!data?.items) return { items: [], total: 0 };

  const items = data.items.map((playlist) => ({
    ...mapPlaylist(playlist as SpotifyApiPlaylist),
    trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
  }));

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] playlists summary limit=${limit} offset=${offset} items=${items.length} total=${data.total}`,
    );
  }

  return { items, total: data.total };
}

export async function getPlaylistTracks(
  token: string,
  playlistId: string,
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<PlaylistTracksResponse>(
    `/playlists/${playlistId}/items?limit=100`,
    token,
  );
  if (!data?.items) return [];

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

export const playlistsPage = action({
  args: {
    accessToken: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    cacheScope: v.optional(v.string()),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: spotifyPlaylistsPageValidator,
  handler: async (_ctx, args) => {
    try {
      return await getUserPlaylists(
        args.accessToken,
        args.limit ?? 50,
        args.offset ?? 0,
      );
    } catch {
      return { items: [], total: 0 };
    }
  },
});

export const playlistTracks = action({
  args: {
    accessToken: v.string(),
    playlistId: v.string(),
    cacheScope: v.optional(v.string()),
  },
  returns: v.array(spotifyTrackValidator),
  handler: async (_ctx, args) => {
    try {
      return await getPlaylistTracks(args.accessToken, args.playlistId);
    } catch (error) {
      throw toPlaylistsError(error, "Could not load playlist tracks.");
    }
  },
});
