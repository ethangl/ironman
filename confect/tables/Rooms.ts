import { Table } from "@confect/server";
import { Schema } from "effect";

import { RoomVisibility } from "../schemas";

export const Rooms = Table.make(
  "rooms",
  Schema.Struct({
    slug: Schema.String,
    name: Schema.String,
    description: Schema.optional(Schema.String),
    visibility: RoomVisibility,
    ownerUserId: Schema.String,
    ownerUserTokenIdentifier: Schema.String,
    createdAt: Schema.Number,
    archivedAt: Schema.NullOr(Schema.Number),
  }),
)
  .index("by_slug", ["slug"])
  .index("by_visibility_and_archivedAt", ["visibility", "archivedAt"])
  .index("by_ownerUserTokenIdentifier", ["ownerUserTokenIdentifier"]);
