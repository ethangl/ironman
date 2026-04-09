import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("feedEvents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(30);

    return events.map((event) => ({
      id: event._id,
      type: event.type,
      detail: event.detail ?? null,
      trackName: event.trackName,
      trackArtist: event.trackArtist,
      userName: event.userName ?? null,
      userImage: event.userImage ?? null,
      createdAt: new Date(event.createdAt).toISOString(),
    }));
  },
});

export const logEvent = mutation({
  args: {
    sourceId: v.string(),
    streakId: v.string(),
    userId: v.string(),
    type: v.union(v.literal("lock_in"), v.literal("surrender")),
    detail: v.optional(v.string()),
    trackName: v.string(),
    trackArtist: v.string(),
    userName: v.optional(v.string()),
    userImage: v.optional(v.string()),
    createdAt: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("feedEvents")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        streakId: args.streakId,
        userId: args.userId,
        type: args.type,
        detail: args.detail,
        trackName: args.trackName,
        trackArtist: args.trackArtist,
        userName: args.userName,
        userImage: args.userImage,
        createdAt: args.createdAt ?? existing.createdAt,
      });
      return existing._id;
    }

    await ctx.db.insert("feedEvents", {
      sourceId: args.sourceId,
      streakId: args.streakId,
      userId: args.userId,
      type: args.type,
      detail: args.detail,
      trackName: args.trackName,
      trackArtist: args.trackArtist,
      userName: args.userName,
      userImage: args.userImage,
      createdAt: args.createdAt ?? Date.now(),
    });
  },
});
