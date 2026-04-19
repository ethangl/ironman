import { v } from "convex/values";

import type { ProfileData } from "../shared/profile-data";
import { query } from "./_generated/server";

export const get = query({
  args: {
    userId: v.string(),
    fallbackName: v.optional(v.string()),
    fallbackImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const profileUser = user
      ? {
          id: user.userId,
          name: user.name,
          image: user.image ?? null,
        }
      : args.fallbackName
        ? {
            id: args.userId,
            name: args.fallbackName,
            image: args.fallbackImage ?? null,
          }
        : null;

    if (!profileUser) {
      return null;
    }

    return {
      user: profileUser,
    } satisfies ProfileData;
  },
});
