import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const cacheEntryValidator = v.object({
  value: v.string(),
  expiresAt: v.number(),
});

export const get = query({
  args: {
    key: v.string(),
  },
  returns: v.union(cacheEntryValidator, v.null()),
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("spotifyCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      return null;
    }

    return {
      value: entry.value,
      expiresAt: entry.expiresAt,
    };
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    expiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("spotifyCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        expiresAt: args.expiresAt,
      });
    } else {
      await ctx.db.insert("spotifyCache", args);
    }

    return null;
  },
});
