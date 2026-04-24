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
const nullableStringValidator = v.union(v.string(), v.null());

const roomActivityKindValidator = v.union(
  v.literal("queue_added"),
  v.literal("track_started"),
  v.literal("chat_message"),
  v.literal("user_entered"),
  v.literal("user_left"),
);

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
  roomFollows: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(),
    followedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_roomId_and_userId", ["roomId", "userId"]),
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
  roomActivityEvents: defineTable({
    roomId: v.id("rooms"),
    kind: roomActivityKindValidator,
    createdAt: v.number(),
    actorUserId: nullableStringValidator,
    actorUserTokenIdentifier: nullableStringValidator,
    body: v.optional(v.string()),
    queueItemId: v.optional(v.id("roomQueueItems")),
    trackId: v.optional(v.string()),
    trackName: v.optional(v.string()),
    trackArtists: v.optional(v.array(v.string())),
    trackImageUrl: v.optional(v.string()),
    trackDurationMs: v.optional(v.number()),
    dedupeKey: v.string(),
  })
    .index("by_roomId_and_createdAt", ["roomId", "createdAt"])
    .index("by_roomId_and_dedupeKey", ["roomId", "dedupeKey"]),
  roomPresenceSessions: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(),
    userTokenIdentifier: v.string(),
    sessionId: v.string(),
    sessionToken: v.string(),
    enteredAt: v.number(),
    leftAt: nullableNumberValidator,
  })
    .index("by_sessionToken", ["sessionToken"])
    .index("by_roomId_and_userId_and_sessionId", [
      "roomId",
      "userId",
      "sessionId",
    ])
    .index("by_roomId_and_userId_and_leftAt", ["roomId", "userId", "leftAt"]),
  spotifyAuthCooldowns: defineTable({
    key: v.string(),
    expiresAt: v.number(),
    retryAfterSeconds: v.number(),
  }).index("by_key", ["key"]),
});
