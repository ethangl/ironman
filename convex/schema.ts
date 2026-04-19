import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  spotifyAuthCooldowns: defineTable({
    key: v.string(),
    expiresAt: v.number(),
    retryAfterSeconds: v.number(),
  }).index("by_key", ["key"]),
});
