import { FunctionSpec, GroupSpec } from "@confect/core";

import type {
  artistBySpotifyId,
  spotifyArtistIdByMusicBrainzId,
} from "./musicbrainz";

/** Plain Convex actions wrapping the relocated musicbrainz component. */
export const musicbrainz = GroupSpec.make("musicbrainz")
  .addFunction(
    FunctionSpec.convexPublicAction<typeof artistBySpotifyId>()(
      "artistBySpotifyId",
    ),
  )
  .addFunction(
    FunctionSpec.convexPublicAction<typeof spotifyArtistIdByMusicBrainzId>()(
      "spotifyArtistIdByMusicBrainzId",
    ),
  );
