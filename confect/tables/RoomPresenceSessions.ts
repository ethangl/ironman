import { GenericId } from "@confect/core";
import { Table } from "@confect/server";
import { Schema } from "effect";

export const RoomPresenceSessions = Table.make(
  "roomPresenceSessions",
  Schema.Struct({
    roomId: GenericId.GenericId("rooms"),
    userId: Schema.String,
    userTokenIdentifier: Schema.String,
    sessionId: Schema.String,
    sessionToken: Schema.String,
    enteredAt: Schema.Number,
    leftAt: Schema.NullOr(Schema.Number),
  }),
)
  .index("by_sessionToken", ["sessionToken"])
  .index("by_roomId_and_userId_and_sessionId", [
    "roomId",
    "userId",
    "sessionId",
  ])
  .index("by_roomId_and_userId_and_leftAt", ["roomId", "userId", "leftAt"]);
