import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import type { SpotifyTrack } from "../components/spotify/types";
import { components } from "../_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const loadAlbumTracksRef =
  anyApi.spotify.albumsLoaders.loadAlbumTracks as FunctionReference<
    "action",
    "internal",
    {
      albumId: string;
    },
    SpotifyTrack[]
  >;

export const spotifyAlbumTracksCache = new ActionCache(components.actionCache, {
  action: loadAlbumTracksRef,
  name: "spotify-album-tracks-v1",
  ttl: DAY_IN_MS,
});
