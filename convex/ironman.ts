import { ConvexError, v } from "convex/values";

import { detectCompletion, isNearTrackEnd } from "./lib/streak";
import {
  applySongSummaryDeltaForTrack,
  hasTrackAttemptForUser,
} from "./songSummaries";
import { internal } from "./_generated/api";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
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

function toSongSummarySource(streak: {
  trackId: string;
  trackName: string;
  trackArtist: string;
  trackImage?: string | null;
  trackDuration: number;
}) {
  return {
    trackId: streak.trackId,
    trackName: streak.trackName,
    trackArtist: streak.trackArtist,
    trackImage: streak.trackImage ?? null,
    trackDuration: streak.trackDuration,
  };
}

async function getActiveStreakForUser(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  return await ctx.db
    .query("streaks")
    .withIndex("by_userId_and_active", (q) =>
      q.eq("userId", userId).eq("active", true),
    )
    .unique();
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
    const isFirstTrackAttempt = !(await hasTrackAttemptForUser(
      ctx,
      args.trackId,
      user._id,
    ));

    await ctx.db.insert("streaks", {
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
      lastCompletionArmed: false,
    });
    await applySongSummaryDeltaForTrack(
      ctx,
      toSongSummarySource({
        trackId: args.trackId,
        trackName: args.trackName,
        trackArtist: args.trackArtist,
        trackImage: args.trackImage,
        trackDuration: args.trackDuration,
      }),
      {
        totalAttempts: 1,
        uniqueUsers: isFirstTrackAttempt ? 1 : 0,
        activeCount: 1,
      },
    );

    await ctx.scheduler.runAfter(0, internal.feed.logEvent, {
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

    return {
      id: streakId,
      trackId: args.trackId,
      trackName: args.trackName,
      trackArtist: args.trackArtist,
      trackImage: args.trackImage ?? null,
      trackDuration: args.trackDuration,
      count: 0,
      active: true,
      hardcore: !!args.hardcore,
      startedAt: new Date(startedAt).toISOString(),
      userName: user.name ?? undefined,
      userImage: user.image ?? undefined,
    };
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
    });
    await applySongSummaryDeltaForTrack(
      ctx,
      toSongSummarySource(streak),
      { activeCount: -1 },
    );

    await ctx.scheduler.runAfter(0, internal.feed.logEvent, {
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
      });
      await applySongSummaryDeltaForTrack(
        ctx,
        toSongSummarySource(streak),
        { totalWeaknesses: 1, activeCount: -1 },
      );

      await ctx.scheduler.runAfter(0, internal.feed.logEvent, {
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
    });
    await applySongSummaryDeltaForTrack(
      ctx,
      toSongSummarySource(streak),
      { totalWeaknesses: 1 },
    );

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

    const wasNearTrackEnd = streak.lastCompletionArmed;
    const isCurrentlyNearTrackEnd = isNearTrackEnd(
      args.progressMs,
      streak.trackDuration,
    );

    const newCount = detectCompletion(
      wasNearTrackEnd,
      args.progressMs,
      streak.trackDuration,
      args.isPlaying,
    )
      ? streak.count + 1
      : streak.count;

    if (
      newCount !== streak.count ||
      isCurrentlyNearTrackEnd !== wasNearTrackEnd
    ) {
      await ctx.db.patch(streak._id, {
        ...(newCount !== streak.count ? { count: newCount } : {}),
        ...(isCurrentlyNearTrackEnd !== wasNearTrackEnd
          ? { lastCompletionArmed: isCurrentlyNearTrackEnd }
          : {}),
      });
      if (newCount !== streak.count) {
        await applySongSummaryDeltaForTrack(
          ctx,
          toSongSummarySource(streak),
          { totalPlays: newCount - streak.count },
        );
      }
    }

    return {
      count: newCount,
      active: true,
      enforceNeeded: false,
    };
  },
});
