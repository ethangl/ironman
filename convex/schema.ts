import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const roomVisibilityValidator = v.union(
  v.literal("public"),
  v.literal("private"),
);

const roomRoleValidator = v.union(
  v.literal("owner"),
  v.literal("moderator"),
  v.literal("member"),
);

const nullableNumberValidator = v.union(v.number(), v.null());

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  rooms: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    visibility: roomVisibilityValidator,
    ownerUserId: v.string(),
    ownerUserTokenIdentifier: v.string(),
    createdAt: v.number(),
    archivedAt: nullableNumberValidator,
  })
    .index("by_slug", ["slug"])
    .index("by_visibility_and_archivedAt", ["visibility", "archivedAt"])
    .index("by_ownerUserTokenIdentifier", ["ownerUserTokenIdentifier"]),
  roomMemberships: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(),
    userTokenIdentifier: v.string(),
    role: roomRoleValidator,
    active: v.boolean(),
    joinedAt: v.number(),
    leftAt: nullableNumberValidator,
  })
    .index("by_roomId_and_active", ["roomId", "active"])
    .index("by_userId_and_active", ["userId", "active"])
    .index("by_userTokenIdentifier_and_active", ["userTokenIdentifier", "active"])
    .index("by_roomId_and_userTokenIdentifier_and_active", [
      "roomId",
      "userTokenIdentifier",
      "active",
    ]),
  roomQueueItems: defineTable({
    roomId: v.id("rooms"),
    position: v.number(),
    trackId: v.string(),
    trackName: v.string(),
    trackArtists: v.array(v.string()),
    trackImageUrl: v.optional(v.string()),
    trackDurationMs: v.number(),
    addedByUserId: v.string(),
    addedByUserTokenIdentifier: v.string(),
    addedAt: v.number(),
    removedAt: nullableNumberValidator,
  })
    .index("by_roomId_and_removedAt_and_position", [
      "roomId",
      "removedAt",
      "position",
    ])
    .index("by_roomId_and_addedAt", ["roomId", "addedAt"]),
  roomPlaybackStates: defineTable({
    roomId: v.id("rooms"),
    currentQueueItemId: v.union(v.id("roomQueueItems"), v.null()),
    startedAt: nullableNumberValidator,
    startOffsetMs: v.number(),
    paused: v.boolean(),
    pausedAt: nullableNumberValidator,
    updatedAt: v.number(),
  }).index("by_roomId", ["roomId"]),
  spotifyAuthCooldowns: defineTable({
    key: v.string(),
    expiresAt: v.number(),
    retryAfterSeconds: v.number(),
  }).index("by_key", ["key"]),
});
