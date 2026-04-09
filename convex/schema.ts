import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  feedEvents: defineTable({
    sourceId: v.string(),
    streakId: v.string(),
    userId: v.string(),
    type: v.union(v.literal("lock_in"), v.literal("surrender")),
    detail: v.optional(v.string()),
    trackName: v.string(),
    trackArtist: v.string(),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index("by_sourceId", ["sourceId"])
    .index("by_createdAt", ["createdAt"]),
  streaks: defineTable({
    streakId: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
    trackId: v.string(),
    trackName: v.string(),
    trackArtist: v.string(),
    trackImage: v.optional(v.string()),
    trackDuration: v.float64(),
    count: v.float64(),
    active: v.boolean(),
    hardcore: v.boolean(),
    startedAt: v.float64(),
    endedAt: v.optional(v.float64()),
    weaknessCount: v.float64(),
    lastProgressMs: v.optional(v.float64()),
    lastCheckedAt: v.optional(v.float64()),
  })
    .index("by_streakId", ["streakId"])
    .index("by_trackId", ["trackId"])
    .index("by_userId", ["userId"])
    .index("by_count", ["count"]),
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
