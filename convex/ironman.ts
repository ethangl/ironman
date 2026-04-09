import { ConvexError, v } from "convex/values";

import { detectCompletion } from "../src/lib/streak";
import { api } from "./_generated/api";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { authComponent } from "./betterAuth";
import type { Doc } from "./_generated/dataModel";

function toStreakData(streak: Doc<"streaks">) {
  return {
    id: streak.streakId,
    trackId: streak.trackId,
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage ?? null,
    trackDuration: streak.trackDuration,
    count: streak.count,
    active: streak.active,
    hardcore: streak.hardcore,
    startedAt: new Date(streak.startedAt).toISOString(),
    userName: streak.userName ?? undefined,
    userImage: streak.userImage ?? undefined,
  };
}

async function getActiveStreakForUser(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  const streaks = await ctx.db
    .query("streaks")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  return streaks.find((streak) => streak.active) ?? null;
}

export const status = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(
      ctx as Parameters<typeof authComponent.getAuthUser>[0],
    );
    const streak = await getActiveStreakForUser(ctx, user._id);
    return streak ? toStreakData(streak) : null;
  },
});

export const start = mutation({
  args: {
    trackId: v.string(),
    trackName: v.string(),
    trackArtist: v.string(),
    trackImage: v.optional(v.string()),
    trackDuration: v.float64(),
    hardcore: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(
      ctx as Parameters<typeof authComponent.getAuthUser>[0],
    );
    const existing = await getActiveStreakForUser(ctx, user._id);

    if (existing) {
      throw new ConvexError("Already in ironman mode. Surrender first.");
    }

    const startedAt = Date.now();
    const streakId = `streak:${user._id}:${startedAt}`;

    const docId = await ctx.db.insert("streaks", {
      streakId,
      userId: user._id,
      userName: user.name ?? undefined,
      userImage: user.image ?? undefined,
      trackId: args.trackId,
      trackName: args.trackName,
      trackArtist: args.trackArtist,
      trackImage: args.trackImage,
      trackDuration: args.trackDuration,
      count: 0,
      active: true,
      hardcore: !!args.hardcore,
      startedAt,
      weaknessCount: 0,
      lastProgressMs: 0,
      lastCheckedAt: startedAt,
    });

    await ctx.runMutation(api.feed.logEvent, {
      sourceId: `ironman:${streakId}:lock_in`,
      streakId,
      userId: user._id,
      type: "lock_in",
      detail: args.hardcore ? "Hardcore mode" : undefined,
      trackName: args.trackName,
      trackArtist: args.trackArtist,
      userName: user.name ?? undefined,
      userImage: user.image ?? undefined,
      createdAt: startedAt,
    });

    const streak = await ctx.db.get(docId);
    if (!streak) {
      throw new ConvexError("Could not start ironman mode.");
    }

    return toStreakData(streak);
  },
});

export const activateHardcore = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(
      ctx as Parameters<typeof authComponent.getAuthUser>[0],
    );
    const streak = await getActiveStreakForUser(ctx, user._id);

    if (!streak) {
      throw new ConvexError("No active streak");
    }

    if (streak.hardcore) {
      throw new ConvexError("Already in hardcore mode");
    }

    await ctx.db.patch(streak._id, {
      hardcore: true,
    });

    return {
      id: streak.streakId,
      hardcore: true,
    };
  },
});

export const surrender = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(
      ctx as Parameters<typeof authComponent.getAuthUser>[0],
    );
    const streak = await getActiveStreakForUser(ctx, user._id);

    if (!streak) {
      throw new ConvexError("No active streak");
    }

    const endedAt = Date.now();
    await ctx.db.patch(streak._id, {
      active: false,
      endedAt,
      lastCheckedAt: endedAt,
    });

    await ctx.runMutation(api.feed.logEvent, {
      sourceId: `ironman:${streak.streakId}:surrender`,
      streakId: streak.streakId,
      userId: user._id,
      type: "surrender",
      detail: `${streak.count} plays`,
      trackName: streak.trackName,
      trackArtist: streak.trackArtist,
      userName: user.name ?? undefined,
      userImage: user.image ?? undefined,
      createdAt: endedAt,
    });

    return {
      id: streak.streakId,
      active: false,
      endedAt: new Date(endedAt).toISOString(),
    };
  },
});

export const reportWeakness = mutation({
  args: {
    type: v.string(),
    detail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(
      ctx as Parameters<typeof authComponent.getAuthUser>[0],
    );
    const streak = await getActiveStreakForUser(ctx, user._id);

    if (!streak) {
      throw new ConvexError("No active streak");
    }

    const nextWeaknessCount = streak.weaknessCount + 1;

    if (streak.hardcore) {
      const endedAt = Date.now();
      await ctx.db.patch(streak._id, {
        active: false,
        endedAt,
        weaknessCount: nextWeaknessCount,
        lastCheckedAt: endedAt,
      });

      await ctx.runMutation(api.feed.logEvent, {
        sourceId: `ironman:${streak.streakId}:hardcore-break`,
        streakId: streak.streakId,
        userId: user._id,
        type: "surrender",
        detail: `Hardcore streak broken by ${args.type} after ${streak.count} plays`,
        trackName: streak.trackName,
        trackArtist: streak.trackArtist,
        userName: user.name ?? undefined,
        userImage: user.image ?? undefined,
        createdAt: endedAt,
      });

      return { broken: true, reason: args.type, count: streak.count };
    }

    await ctx.db.patch(streak._id, {
      weaknessCount: nextWeaknessCount,
      lastCheckedAt: Date.now(),
    });

    return { broken: false };
  },
});

export const poll = mutation({
  args: {
    progressMs: v.float64(),
    trackId: v.string(),
    isPlaying: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(
      ctx as Parameters<typeof authComponent.getAuthUser>[0],
    );
    const streak = await getActiveStreakForUser(ctx, user._id);

    if (!streak) {
      throw new ConvexError("no_active_streak");
    }

    if (args.trackId !== streak.trackId) {
      return {
        count: streak.count,
        active: true,
        enforceNeeded: true,
      };
    }

    const newCount = detectCompletion(
      streak.lastProgressMs ?? 0,
      args.progressMs,
      streak.trackDuration,
      args.isPlaying,
    )
      ? streak.count + 1
      : streak.count;

    await ctx.db.patch(streak._id, {
      count: newCount,
      lastProgressMs: args.progressMs,
      lastCheckedAt: Date.now(),
    });

    return {
      count: newCount,
      active: true,
      enforceNeeded: false,
    };
  },
});
