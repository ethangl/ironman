import { FunctionImpl, GroupImpl } from "@confect/server";
import { Layer } from "effect";

import api from "./_generated/api";
import {
  artistBySpotifyId,
  spotifyArtistIdByMusicBrainzId,
} from "./musicbrainz";

export const musicbrainz = GroupImpl.make(api, "musicbrainz").pipe(
  Layer.provide(
    FunctionImpl.make(api, "musicbrainz", "artistBySpotifyId", artistBySpotifyId),
  ),
  Layer.provide(
    FunctionImpl.make(
      api,
      "musicbrainz",
      "spotifyArtistIdByMusicBrainzId",
      spotifyArtistIdByMusicBrainzId,
    ),
  ),
);
