import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  trackAudioFeatures: defineTable({
    spotifyTrackId: v.string(),
    isrc: v.optional(v.string()),
    acousticness: v.number(),
    danceability: v.number(),
    energy: v.number(),
    instrumentalness: v.number(),
    key: v.number(),
    liveness: v.number(),
    loudness: v.number(),
    mode: v.number(),
    speechiness: v.number(),
    tempo: v.number(),
    valence: v.number(),
    fetchedAt: v.float64(),
  }).index("by_spotifyTrackId", ["spotifyTrackId"]),
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
