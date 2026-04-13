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
    lastCompletionArmed: v.boolean(),
  })
    .index("by_streakId", ["streakId"])
    .index("by_trackId", ["trackId"])
    .index("by_trackId_and_active", ["trackId", "active"])
    .index("by_trackId_and_count", ["trackId", "count"])
    .index("by_trackId_and_userId", ["trackId", "userId"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_active", ["userId", "active"])
    .index("by_userId_and_count", ["userId", "count"])
    .index("by_count", ["count"]),
  songSummaries: defineTable({
    trackId: v.string(),
    trackName: v.string(),
    trackArtist: v.string(),
    trackImage: v.optional(v.string()),
    trackDuration: v.float64(),
    totalPlays: v.float64(),
    totalAttempts: v.float64(),
    totalWeaknesses: v.float64(),
    avgCountRaw: v.float64(),
    avgCountRounded: v.float64(),
    weaknessRate: v.float64(),
    weaknessFavorability: v.float64(),
    difficulty: v.float64(),
    uniqueUsers: v.float64(),
    activeCount: v.float64(),
  })
    .index("by_trackId", ["trackId"])
    .index("by_avgCountRounded_and_weaknessFavorability", [
      "avgCountRounded",
      "weaknessFavorability",
    ])
    .index("by_difficulty", ["difficulty"]),
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
