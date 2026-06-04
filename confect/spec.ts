import { Spec } from "@confect/core";

import { roomPresence } from "./roomPresence.spec";
import { rooms } from "./rooms.spec";
import { spotify } from "./spotify.spec";
import { spotifyAuthCooldown } from "./spotifyAuthCooldown.spec";

/**
 * Master spec — `confect codegen` reads this default export. Groups are added
 * here as they are ported. (Remaining: userProfiles, users, profile, lastfm,
 * musicbrainz.)
 */
export default Spec.make()
  .add(spotifyAuthCooldown)
  .add(spotify)
  .add(rooms)
  .add(roomPresence);
