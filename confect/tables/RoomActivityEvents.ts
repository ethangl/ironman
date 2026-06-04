import { GenericId } from "@confect/core";
import { Table } from "@confect/server";
import { Schema } from "effect";

import { RoomActivityKind } from "../schemas";

export const RoomActivityEvents = Table.make(
  "roomActivityEvents",
  Schema.Struct({
    roomId: GenericId.GenericId("rooms"),
    kind: RoomActivityKind,
    createdAt: Schema.Number,
    actorUserId: Schema.NullOr(Schema.String),
    actorUserTokenIdentifier: Schema.NullOr(Schema.String),
    body: Schema.optional(Schema.String),
    queueItemId: Schema.optional(GenericId.GenericId("roomQueueItems")),
    trackId: Schema.optional(Schema.String),
    trackName: Schema.optional(Schema.String),
    trackArtists: Schema.optional(Schema.Array(Schema.String)),
    trackImageUrl: Schema.optional(Schema.String),
    trackDurationMs: Schema.optional(Schema.Number),
    dedupeKey: Schema.String,
  }),
)
  .index("by_roomId_and_createdAt", ["roomId", "createdAt"])
  .index("by_roomId_and_dedupeKey", ["roomId", "dedupeKey"]);
