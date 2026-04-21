import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import type { SpotifyArtist, SpotifyArtistPageData } from "../components/spotify/types";
import { components } from "../_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const loadArtistPageRef =
  anyApi.spotify.artistsLoaders.loadArtistPage as FunctionReference<
    "action",
    "internal",
    {
      artistId: string;
      cacheScope: string;
    },
    SpotifyArtistPageData | null
  >;

const loadTopArtistsRef =
  anyApi.spotify.artistsLoaders.loadTopArtists as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyArtist[]
  >;

const loadFavoriteArtistsRef =
  anyApi.spotify.artistsLoaders.loadFavoriteArtists as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyArtist[]
  >;

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
