import { GenericId } from "@confect/core";
import { Table } from "@confect/server";
import { Schema } from "effect";

import { RoomRole } from "../schemas";

export const RoomMemberships = Table.make(
  "roomMemberships",
  Schema.Struct({
    roomId: GenericId.GenericId("rooms"),
    userId: Schema.String,
    userTokenIdentifier: Schema.String,
    role: RoomRole,
    active: Schema.Boolean,
    joinedAt: Schema.Number,
    leftAt: Schema.NullOr(Schema.Number),
  }),
)
  .index("by_roomId_and_active", ["roomId", "active"])
  .index("by_userId_and_active", ["userId", "active"])
  .index("by_userTokenIdentifier_and_active", ["userTokenIdentifier", "active"])
  .index("by_roomId_and_userTokenIdentifier_and_active", [
    "roomId",
    "userTokenIdentifier",
    "active",
  ]);
