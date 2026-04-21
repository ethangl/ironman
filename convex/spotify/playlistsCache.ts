import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import type { SpotifyPlaylistsPage, SpotifyTrack } from "../components/spotify/types";
import { components } from "../_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const loadPlaylistsPageRef =
  anyApi.spotify.playlistsLoaders.loadPlaylistsPage as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      offset: number;
      cacheScope: string;
    },
    SpotifyPlaylistsPage
  >;

const loadPlaylistTracksRef =
  anyApi.spotify.playlistsLoaders.loadPlaylistTracks as FunctionReference<
    "action",
    "internal",
    {
      playlistId: string;
      cacheScope: string;
    },
    SpotifyTrack[]
  >;

export const spotifyPlaylistsPageCache = new ActionCache(
  components.actionCache,
  {
    action: loadPlaylistsPageRef,
    name: "spotify-playlists-page-v1",
    ttl: DAY_IN_MS,
  },
);

export const spotifyPlaylistTracksCache = new ActionCache(
  components.actionCache,
  {
    action: loadPlaylistTracksRef,
    name: "spotify-playlist-tracks-v1",
    ttl: DAY_IN_MS,
  },
);
