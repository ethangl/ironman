import { GenericId } from "@confect/core";
import { Table } from "@confect/server";
import { Schema } from "effect";

export const RoomQueueItems = Table.make(
  "roomQueueItems",
  Schema.Struct({
    roomId: GenericId.GenericId("rooms"),
    position: Schema.Number,
    trackId: Schema.String,
    trackName: Schema.String,
    trackArtists: Schema.Array(Schema.String),
    trackImageUrl: Schema.optional(Schema.String),
    trackDurationMs: Schema.Number,
    addedByUserId: Schema.String,
    addedByUserTokenIdentifier: Schema.String,
    addedAt: Schema.Number,
    removedAt: Schema.NullOr(Schema.Number),
  }),
)
  .index("by_roomId_and_removedAt_and_position", [
    "roomId",
    "removedAt",
    "position",
  ])
  .index("by_roomId_and_addedAt", ["roomId", "addedAt"]);
