import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import {
  type SpotifyArtist,
  type SpotifyArtistPageData,
  type SpotifyPlaylist,
  type SpotifySearchResults,
  type SpotifyTrack,
} from "./components/spotify/types";
import { components } from "./_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SpotifyRecentlyPlayedResult = {
  items: Array<{
    playedAt: string;
    track: SpotifyTrack;
  }>;
  rateLimited: boolean;
};

type SpotifyPlaylistsPage = {
  items: SpotifyPlaylist[];
  total: number;
};

const loadSearchResultsRef = anyApi.spotifyLoaders.loadSearchResults as FunctionReference<
  "action",
  "internal",
  {
    query: string;
  },
  SpotifySearchResults
>;

const loadSearchTracksRef = anyApi.spotifyLoaders.loadSearchTracks as FunctionReference<
  "action",
  "internal",
  {
    query: string;
  },
  SpotifyTrack[]
>;

const loadArtistPageRef = anyApi.spotifyLoaders.loadArtistPage as FunctionReference<
  "action",
  "internal",
  {
    artistId: string;
    cacheScope: string;
  },
  SpotifyArtistPageData | null
>;

const loadAlbumTracksRef = anyApi.spotifyLoaders.loadAlbumTracks as FunctionReference<
  "action",
  "internal",
  {
    albumId: string;
  },
  SpotifyTrack[]
>;

const loadRecentlyPlayedRef =
  anyApi.spotifyLoaders.loadRecentlyPlayed as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyRecentlyPlayedResult
  >;

const loadPlaylistsPageRef =
  anyApi.spotifyLoaders.loadPlaylistsPage as FunctionReference<
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
  anyApi.spotifyLoaders.loadPlaylistTracks as FunctionReference<
    "action",
    "internal",
    {
      playlistId: string;
      cacheScope: string;
    },
    SpotifyTrack[]
  >;

const loadTopArtistsRef = anyApi.spotifyLoaders.loadTopArtists as FunctionReference<
  "action",
  "internal",
  {
    limit: number;
    cacheScope: string;
  },
  SpotifyArtist[]
>;

const loadFavoriteArtistsRef =
  anyApi.spotifyLoaders.loadFavoriteArtists as FunctionReference<
    "action",
    "internal",
    {
      limit: number;
      cacheScope: string;
    },
    SpotifyArtist[]
  >;

export const spotifySearchResultsCache = new ActionCache(
  components.actionCache,
  {
    action: loadSearchResultsRef,
    name: "spotify-search-results-v1",
    ttl: DAY_IN_MS,
  },
);

export const spotifySearchTracksCache = new ActionCache(components.actionCache, {
  action: loadSearchTracksRef,
  name: "spotify-search-tracks-v1",
  ttl: DAY_IN_MS,
});

export const spotifyArtistPageCache = new ActionCache(components.actionCache, {
  action: loadArtistPageRef,
  name: "spotify-artist-page-v1",
  ttl: DAY_IN_MS,
});

export const spotifyAlbumTracksCache = new ActionCache(components.actionCache, {
  action: loadAlbumTracksRef,
  name: "spotify-album-tracks-v1",
  ttl: DAY_IN_MS,
});

export const spotifyRecentlyPlayedCache = new ActionCache(
  components.actionCache,
  {
    action: loadRecentlyPlayedRef,
    name: "spotify-recently-played-v1",
    ttl: DAY_IN_MS,
  },
);

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
