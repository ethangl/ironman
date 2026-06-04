import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  musicbrainzRequestSchedule: defineTable({
    key: v.string(),
    nextAllowedAt: v.number(),
  }).index("by_key", ["key"]),
});
