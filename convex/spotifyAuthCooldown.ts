import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";

export const get = internalQuery({
  args: {
    key: v.string(),
  },
  returns: v.union(
    v.object({
      expiresAt: v.number(),
      retryAfterSeconds: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("spotifyAuthCooldowns")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!entry || entry.expiresAt <= Date.now()) {
      return null;
    }

    return {
      expiresAt: entry.expiresAt,
      retryAfterSeconds: entry.retryAfterSeconds,
    };
  },
});

export const set = internalMutation({
  args: {
    key: v.string(),
    expiresAt: v.number(),
    retryAfterSeconds: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("spotifyAuthCooldowns")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        expiresAt: args.expiresAt,
        retryAfterSeconds: args.retryAfterSeconds,
      });
    } else {
      await ctx.db.insert("spotifyAuthCooldowns", args);
    }

    return null;
  },
});

export const clear = internalMutation({
  args: {
    key: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("spotifyAuthCooldowns")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return null;
  },
});
