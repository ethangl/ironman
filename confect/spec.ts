import { Spec } from "@confect/core";

import { spotifyAuthCooldown } from "./spotifyAuthCooldown.spec";

/**
 * Master spec — `confect codegen` reads this default export. Groups are added
 * here as they are ported. (Remaining: spotify, rooms, userProfiles, users,
 * profile, lastfm, musicbrainz.)
 */
export default Spec.make().add(spotifyAuthCooldown);
