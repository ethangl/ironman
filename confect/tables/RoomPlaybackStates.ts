import { GenericId } from "@confect/core";
import { Table } from "@confect/server";
import { Schema } from "effect";

export const RoomPlaybackStates = Table.make(
  "roomPlaybackStates",
  Schema.Struct({
    roomId: GenericId.GenericId("rooms"),
    currentQueueItemId: Schema.NullOr(GenericId.GenericId("roomQueueItems")),
    startedAt: Schema.NullOr(Schema.Number),
    startOffsetMs: Schema.Number,
    paused: Schema.Boolean,
    pausedAt: Schema.NullOr(Schema.Number),
    updatedAt: Schema.Number,
  }),
).index("by_roomId", ["roomId"]);
