import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const upsert = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const payload = {
      userId: args.userId,
      name: args.name,
      image: args.image,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("users", payload);
  },
});
