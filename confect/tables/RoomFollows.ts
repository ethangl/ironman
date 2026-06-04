import { GenericId } from "@confect/core";
import { Table } from "@confect/server";
import { Schema } from "effect";

export const RoomFollows = Table.make(
  "roomFollows",
  Schema.Struct({
    roomId: GenericId.GenericId("rooms"),
    userId: Schema.String,
    followedAt: Schema.Number,
  }),
)
  .index("by_userId", ["userId"])
  .index("by_roomId_and_userId", ["roomId", "userId"]);
