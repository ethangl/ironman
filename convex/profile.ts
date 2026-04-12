import { v } from "convex/values";

import { buildProfileDataFromVisibleSortedStreaks } from "../shared/profile-data";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

function toProfileStreak(streak: Doc<"streaks">) {
  return {
    id: streak.streakId,
    userId: streak.userId,
    count: streak.count,
    active: streak.active,
    hardcore: streak.hardcore,
    trackId: streak.trackId,
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage ?? null,
    trackDuration: streak.trackDuration,
    startedAtMs: streak.startedAt,
    endedAtMs: streak.endedAt ?? undefined,
    userName: streak.userName ?? null,
    userImage: streak.userImage ?? null,
    weaknessCount: streak.weaknessCount,
  };
}

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

    const visibleStreaks = await ctx.db
      .query("streaks")
      .withIndex("by_userId_and_count", (q) =>
        q.eq("userId", args.userId).gte("count", 2),
      )
      .order("desc")
      .collect();

    return buildProfileDataFromVisibleSortedStreaks(
      profileUser,
      visibleStreaks.map(toProfileStreak),
    );
  },
});
