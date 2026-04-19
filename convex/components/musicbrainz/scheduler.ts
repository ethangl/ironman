import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const reserve = mutation({
  args: {
    key: v.string(),
    intervalMs: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("musicbrainzRequestSchedule")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    const now = Date.now();
    const scheduledAt = existing ? Math.max(existing.nextAllowedAt, now) : now;
    const waitMs = Math.max(0, scheduledAt - now);
    const nextAllowedAt = scheduledAt + Math.max(0, args.intervalMs);

    if (existing) {
      await ctx.db.patch(existing._id, { nextAllowedAt });
    } else {
      await ctx.db.insert("musicbrainzRequestSchedule", {
        key: args.key,
        nextAllowedAt,
      });
    }

    return waitMs;
  },
});
