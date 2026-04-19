import { ActionCache } from "@convex-dev/action-cache";
import { anyApi, type FunctionReference } from "convex/server";

import type {
  MusicBrainzArtistLinks,
  MusicBrainzArtistLookup,
} from "./client";
import { components } from "./_generated/api";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type MusicBrainzArtistMatch = MusicBrainzArtistLookup & {
  links: MusicBrainzArtistLinks;
};

const loadArtistBySpotifyIdRef =
  anyApi.loaders.loadArtistBySpotifyId as FunctionReference<
    "action",
    "internal",
    {
      spotifyArtistId: string;
    },
    MusicBrainzArtistMatch | null
  >;

const loadSpotifyArtistIdByMusicBrainzIdRef =
  anyApi.loaders.loadSpotifyArtistIdByMusicBrainzId as FunctionReference<
    "action",
    "internal",
    {
      musicBrainzArtistId: string;
    },
    string | null
  >;

export const artistBySpotifyIdCache = new ActionCache(components.actionCache, {
  action: loadArtistBySpotifyIdRef,
  name: "musicbrainz-artist-by-spotify-id-v1",
  ttl: DAY_IN_MS,
});

export const spotifyArtistIdByMusicBrainzIdCache = new ActionCache(
  components.actionCache,
  {
    action: loadSpotifyArtistIdByMusicBrainzIdRef,
    name: "musicbrainz-spotify-artist-id-by-mbid-v1",
    ttl: DAY_IN_MS,
  },
);
