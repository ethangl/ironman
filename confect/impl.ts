import { Impl } from "@confect/server";
import { Layer } from "effect";

import api from "./_generated/api";
import { roomPresence } from "./roomPresence.impl";
import { rooms } from "./rooms.impl";
import { spotify } from "./spotify.impl";
import { spotifyAuthCooldown } from "./spotifyAuthCooldown.impl";

/** Master implementation layer — wires every group impl together. */
export default Impl.make(api).pipe(
  Layer.provide(spotifyAuthCooldown),
  Layer.provide(spotify),
  Layer.provide(rooms),
  Layer.provide(roomPresence),
  Impl.finalize,
);
