import { Table } from "@confect/server";
import { Schema } from "effect";

export const SpotifyAuthCooldowns = Table.make(
  "spotifyAuthCooldowns",
  Schema.Struct({
    key: Schema.String,
    expiresAt: Schema.Number,
    retryAfterSeconds: Schema.Number,
  }),
).index("by_key", ["key"]);
