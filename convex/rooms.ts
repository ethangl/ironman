import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  moveRoomQueueItemIds,
  resolveRoomPlaybackState,
} from "../shared/rooms-state";
import { requireAuthUser } from "./spotifySession";

const roomVisibilityValidator = v.union(
  v.literal("public"),
  v.literal("private"),
);

const roomLookupArgsValidator = {
  roomId: v.optional(v.id("rooms")),
  slug: v.optional(v.string()),
};

const enqueueTrackArgsValidator = {
  roomId: v.id("rooms"),
  trackId: v.string(),
  trackName: v.string(),
  trackArtists: v.array(v.string()),
  trackImageUrl: v.optional(v.string()),
  trackDurationMs: v.number(),
};

type RoomCtx = QueryCtx | MutationCtx;
type RoomDoc = Doc<"rooms">;
type RoomMembershipDoc = Doc<"roomMemberships">;
type RoomQueueItemDoc = Doc<"roomQueueItems">;
type RoomPlaybackStateDoc = Doc<"roomPlaybackStates">;

function clampPlaybackOffset(offsetMs: number, durationMs: number) {
  if (!Number.isFinite(offsetMs)) {
    return 0;
  }

  return Math.max(0, Math.min(Math.trunc(offsetMs), Math.max(durationMs - 1, 0)));
}

function slugifyRoomName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "room";
}

function buildRoomSnapshot(room: RoomDoc) {
  return {
    _id: room._id,
    slug: room.slug,
    name: room.name,
    description: room.description ?? null,
    visibility: room.visibility,
    ownerUserId: room.ownerUserId,
    createdAt: room.createdAt,
    archivedAt: room.archivedAt,
  };
}

function buildMembershipSnapshot(membership: RoomMembershipDoc | null) {
  if (!membership) {
    return null;
  }

  return {
    _id: membership._id,
    role: membership.role,
    active: membership.active,
    joinedAt: membership.joinedAt,
    leftAt: membership.leftAt,
  };
}

function buildQueueItemSnapshot(queueItem: RoomQueueItemDoc) {
  return {
    _id: queueItem._id,
    roomId: queueItem.roomId,
    position: queueItem.position,
    trackId: queueItem.trackId,
    trackName: queueItem.trackName,
    trackArtists: queueItem.trackArtists,
    trackImageUrl: queueItem.trackImageUrl ?? null,
    trackDurationMs: queueItem.trackDurationMs,
    addedByUserId: queueItem.addedByUserId,
    addedAt: queueItem.addedAt,
  };
}

function isModeratorRole(membership: RoomMembershipDoc | null) {
  return membership?.role === "owner" || membership?.role === "moderator";
}

async function requireRoomAuth(ctx: RoomCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const user = await requireAuthUser(ctx);
  const userId =
    typeof user.userId === "string" && user.userId.length > 0
      ? user.userId
      : String(user._id);

  return {
    tokenIdentifier: identity.tokenIdentifier,
    userId,
  };
}

async function getRoomBySlug(ctx: RoomCtx, slug: string) {
  const room = await ctx.db
    .query("rooms")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  if (!room || room.archivedAt !== null) {
    return null;
  }

  return room;
}

async function getRoomOrNull(
  ctx: RoomCtx,
  roomId: Id<"rooms"> | undefined,
  slug: string | undefined,
) {
  if ((roomId ? 1 : 0) + (slug ? 1 : 0) !== 1) {
    throw new Error("Provide exactly one room identifier.");
  }

  if (roomId) {
    const room = await ctx.db.get(roomId);
    if (!room || room.archivedAt !== null) {
      return null;
    }

    return room;
  }

  return getRoomBySlug(ctx, slug!);
}

async function getRoomOrThrow(ctx: RoomCtx, roomId: Id<"rooms">) {
  const room = await ctx.db.get(roomId);
  if (!room || room.archivedAt !== null) {
    throw new Error("Room not found.");
  }

  return room;
}

async function getActiveMembership(
  ctx: RoomCtx,
  roomId: Id<"rooms">,
  tokenIdentifier: string,
) {
  return ctx.db
    .query("roomMemberships")
    .withIndex("by_roomId_and_userTokenIdentifier_and_active", (q) =>
      q
        .eq("roomId", roomId)
        .eq("userTokenIdentifier", tokenIdentifier)
        .eq("active", true),
    )
    .unique();
}

async function getActiveRoomMemberships(ctx: RoomCtx, roomId: Id<"rooms">) {
  return ctx.db
    .query("roomMemberships")
    .withIndex("by_roomId_and_active", (q) =>
      q.eq("roomId", roomId).eq("active", true),
    )
    .collect();
}

async function getActiveQueueItems(ctx: RoomCtx, roomId: Id<"rooms">) {
  return ctx.db
    .query("roomQueueItems")
    .withIndex("by_roomId_and_removedAt_and_position", (q) =>
      q.eq("roomId", roomId).eq("removedAt", null),
    )
    .collect();
}

async function getPlaybackStateDoc(
  ctx: RoomCtx,
  roomId: Id<"rooms">,
) {
  const playbackState = await ctx.db
    .query("roomPlaybackStates")
    .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
    .unique();

  if (!playbackState) {
    throw new Error("Room playback state not found.");
  }

  return playbackState;
}

async function getVisibleRoomContext(
  ctx: RoomCtx,
  roomId: Id<"rooms"> | undefined,
  slug: string | undefined,
) {
  const auth = await requireRoomAuth(ctx);
  const room = await getRoomOrNull(ctx, roomId, slug);
  if (!room) {
    return null;
  }

  const membership = await getActiveMembership(ctx, room._id, auth.tokenIdentifier);
  if (
    room.visibility === "private" &&
    room.ownerUserTokenIdentifier !== auth.tokenIdentifier &&
    !membership
  ) {
    return null;
  }

  return {
    auth,
    room,
    membership,
  };
}

async function requireActiveMemberContext(ctx: RoomCtx, roomId: Id<"rooms">) {
  const auth = await requireRoomAuth(ctx);
  const room = await getRoomOrThrow(ctx, roomId);
  const membership = await getActiveMembership(ctx, room._id, auth.tokenIdentifier);
  if (!membership) {
    throw new Error("Join the room to continue.");
  }

  return {
    auth,
    room,
    membership,
  };
}

async function requireModeratorContext(ctx: RoomCtx, roomId: Id<"rooms">) {
  const memberContext = await requireActiveMemberContext(ctx, roomId);
  if (!isModeratorRole(memberContext.membership)) {
    throw new Error("Only room owners and moderators can do that.");
  }

  return memberContext;
}

async function syncRoomPlaybackState(
  ctx: MutationCtx,
  playbackState: RoomPlaybackStateDoc,
  patch: Partial<
    Pick<
      RoomPlaybackStateDoc,
      "currentQueueItemId" | "startedAt" | "startOffsetMs" | "paused" | "pausedAt" | "updatedAt"
    >
  >,
) {
  await ctx.db.patch(playbackState._id, patch);
}

async function normalizeQueuePositions(
  ctx: MutationCtx,
  queueItems: readonly RoomQueueItemDoc[],
) {
  for (const [index, queueItem] of queueItems.entries()) {
    if (queueItem.position === index) {
      continue;
    }

    await ctx.db.patch(queueItem._id, { position: index });
  }
}

async function pauseRoomPlayback(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  now: number,
) {
  const [queueItems, playbackState] = await Promise.all([
    getActiveQueueItems(ctx, roomId),
    getPlaybackStateDoc(ctx, roomId),
  ]);
  const resolvedPlaybackState = resolveRoomPlaybackState(
    queueItems,
    playbackState,
    now,
  );

  await syncRoomPlaybackState(ctx, playbackState, {
    currentQueueItemId: resolvedPlaybackState.currentQueueItemId,
    startedAt: resolvedPlaybackState.currentQueueItemId ? now : null,
    startOffsetMs: resolvedPlaybackState.currentOffsetMs,
    paused: true,
    pausedAt: now,
    updatedAt: now,
  });
}

async function uniqueRoomSlug(ctx: MutationCtx, preferredSlug: string) {
  let slug = preferredSlug;
  let suffix = 2;

  for (;;) {
    const existingRoom = await ctx.db
      .query("rooms")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!existingRoom) {
      return slug;
    }

    slug = `${preferredSlug}-${suffix}`;
    suffix += 1;
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireRoomAuth(ctx);
    const [rooms, memberships] = await Promise.all([
      ctx.db
        .query("rooms")
        .withIndex("by_visibility_and_archivedAt", (q) =>
          q.eq("visibility", "public").eq("archivedAt", null),
        )
        .collect(),
      ctx.db
        .query("roomMemberships")
        .withIndex("by_userTokenIdentifier_and_active", (q) =>
          q.eq("userTokenIdentifier", auth.tokenIdentifier).eq("active", true),
        )
        .collect(),
    ]);

    const membershipsByRoomId = new Map(
      memberships.map((membership) => [membership.roomId, membership]),
    );

    return rooms.map((room) => ({
      room: buildRoomSnapshot(room),
      viewerMembership: buildMembershipSnapshot(
        membershipsByRoomId.get(room._id) ?? null,
      ),
    }));
  },
});

export const get = query({
  args: roomLookupArgsValidator,
  handler: async (ctx, args) => {
    const visibleRoomContext = await getVisibleRoomContext(
      ctx,
      args.roomId,
      args.slug,
    );
    if (!visibleRoomContext) {
      return null;
    }

    const [queueItems, playbackState, activeMemberships] = await Promise.all([
      getActiveQueueItems(ctx, visibleRoomContext.room._id),
      getPlaybackStateDoc(ctx, visibleRoomContext.room._id),
      getActiveRoomMemberships(ctx, visibleRoomContext.room._id),
    ]);
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      Date.now(),
    );
    const currentQueueItem =
      queueItems.find(
        (queueItem) =>
          queueItem._id === resolvedPlaybackState.currentQueueItemId,
      ) ?? null;

    return {
      room: buildRoomSnapshot(visibleRoomContext.room),
      viewerMembership: buildMembershipSnapshot(visibleRoomContext.membership),
      memberCount: activeMemberships.length,
      queueLength: queueItems.length,
      playback: {
        currentQueueItemId: resolvedPlaybackState.currentQueueItemId,
        currentQueueItem: currentQueueItem
          ? buildQueueItemSnapshot(currentQueueItem)
          : null,
        expectedOffsetMs: resolvedPlaybackState.currentOffsetMs,
        paused: resolvedPlaybackState.paused,
      },
    };
  },
});

export const getQueue = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const visibleRoomContext = await getVisibleRoomContext(ctx, args.roomId, undefined);
    if (!visibleRoomContext) {
      return null;
    }

    const queueItems = await getActiveQueueItems(ctx, visibleRoomContext.room._id);
    return {
      room: buildRoomSnapshot(visibleRoomContext.room),
      viewerMembership: buildMembershipSnapshot(visibleRoomContext.membership),
      queue: queueItems.map(buildQueueItemSnapshot),
    };
  },
});

export const getPlaybackState = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const visibleRoomContext = await getVisibleRoomContext(ctx, args.roomId, undefined);
    if (!visibleRoomContext) {
      return null;
    }

    const [queueItems, playbackState, activeMemberships] = await Promise.all([
      getActiveQueueItems(ctx, visibleRoomContext.room._id),
      getPlaybackStateDoc(ctx, visibleRoomContext.room._id),
      getActiveRoomMemberships(ctx, visibleRoomContext.room._id),
    ]);
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      Date.now(),
    );
    const currentQueueItem =
      queueItems.find(
        (queueItem) =>
          queueItem._id === resolvedPlaybackState.currentQueueItemId,
      ) ?? null;

    return {
      room: buildRoomSnapshot(visibleRoomContext.room),
      viewerMembership: buildMembershipSnapshot(visibleRoomContext.membership),
      memberCount: activeMemberships.length,
      queueLength: queueItems.length,
      currentQueueItemId: resolvedPlaybackState.currentQueueItemId,
      currentQueueItem: currentQueueItem ? buildQueueItemSnapshot(currentQueueItem) : null,
      expectedOffsetMs: resolvedPlaybackState.currentOffsetMs,
      startedAt: resolvedPlaybackState.startedAt,
      startOffsetMs: resolvedPlaybackState.startOffsetMs,
      paused: resolvedPlaybackState.paused,
      pausedAt: resolvedPlaybackState.pausedAt,
      updatedAt: playbackState.updatedAt,
      canEnqueue: !!visibleRoomContext.membership,
      canManageQueue: isModeratorRole(visibleRoomContext.membership),
      canControlPlayback: isModeratorRole(visibleRoomContext.membership),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(roomVisibilityValidator),
  },
  handler: async (ctx, args) => {
    const auth = await requireRoomAuth(ctx);
    const name = args.name.trim();
    if (!name) {
      throw new Error("Room name is required.");
    }

    const description = args.description?.trim();
    const now = Date.now();
    const slug = await uniqueRoomSlug(
      ctx,
      slugifyRoomName(args.slug ?? name),
    );

    const roomId = await ctx.db.insert("rooms", {
      slug,
      name,
      ...(description ? { description } : {}),
      visibility: args.visibility ?? "public",
      ownerUserId: auth.userId,
      ownerUserTokenIdentifier: auth.tokenIdentifier,
      createdAt: now,
      archivedAt: null,
    });

    const membershipId = await ctx.db.insert("roomMemberships", {
      roomId,
      userId: auth.userId,
      userTokenIdentifier: auth.tokenIdentifier,
      role: "owner",
      active: true,
      joinedAt: now,
      leftAt: null,
    });

    await ctx.db.insert("roomPlaybackStates", {
      roomId,
      currentQueueItemId: null,
      startedAt: null,
      startOffsetMs: 0,
      paused: true,
      pausedAt: now,
      updatedAt: now,
    });

    return {
      roomId,
      membershipId,
      slug,
    };
  },
});

export const join = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const auth = await requireRoomAuth(ctx);
    const room = await getRoomOrThrow(ctx, args.roomId);
    const activeMembership = await getActiveMembership(
      ctx,
      room._id,
      auth.tokenIdentifier,
    );
    if (activeMembership) {
      return {
        roomId: room._id,
        membershipId: activeMembership._id,
        role: activeMembership.role,
      };
    }

    if (
      room.visibility === "private" &&
      room.ownerUserTokenIdentifier !== auth.tokenIdentifier
    ) {
      throw new Error("Private rooms cannot be joined yet.");
    }

    const membershipId = await ctx.db.insert("roomMemberships", {
      roomId: room._id,
      userId: auth.userId,
      userTokenIdentifier: auth.tokenIdentifier,
      role:
        room.ownerUserTokenIdentifier === auth.tokenIdentifier
          ? "owner"
          : "member",
      active: true,
      joinedAt: Date.now(),
      leftAt: null,
    });

    return {
      roomId: room._id,
      membershipId,
      role:
        room.ownerUserTokenIdentifier === auth.tokenIdentifier
          ? "owner"
          : "member",
    };
  },
});

export const leave = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const memberContext = await requireActiveMemberContext(ctx, args.roomId);
    const now = Date.now();

    await ctx.db.patch(memberContext.membership._id, {
      active: false,
      leftAt: now,
    });

    const remainingMemberships = await getActiveRoomMemberships(
      ctx,
      memberContext.room._id,
    );
    if (remainingMemberships.length === 0) {
      await pauseRoomPlayback(ctx, memberContext.room._id, now);
    }

    return {
      roomId: memberContext.room._id,
      leftAt: now,
    };
  },
});

export const enqueueTrack = mutation({
  args: enqueueTrackArgsValidator,
  handler: async (ctx, args) => {
    const memberContext = await requireActiveMemberContext(ctx, args.roomId);
    const trackId = args.trackId.trim();
    const trackName = args.trackName.trim();
    if (!trackId || !trackName) {
      throw new Error("Tracks need both an id and a name.");
    }

    if (args.trackDurationMs <= 0) {
      throw new Error("Track duration must be greater than zero.");
    }

    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, memberContext.room._id),
      getPlaybackStateDoc(ctx, memberContext.room._id),
    ]);
    const now = Date.now();
    const queueItemId = await ctx.db.insert("roomQueueItems", {
      roomId: memberContext.room._id,
      position: queueItems.length,
      trackId,
      trackName,
      trackArtists: args.trackArtists,
      ...(args.trackImageUrl ? { trackImageUrl: args.trackImageUrl } : {}),
      trackDurationMs: args.trackDurationMs,
      addedByUserId: memberContext.auth.userId,
      addedByUserTokenIdentifier: memberContext.auth.tokenIdentifier,
      addedAt: now,
      removedAt: null,
    });

    if (playbackState.currentQueueItemId === null) {
      await syncRoomPlaybackState(ctx, playbackState, {
        currentQueueItemId: queueItemId,
        startedAt: now,
        startOffsetMs: 0,
        paused: true,
        pausedAt: now,
        updatedAt: now,
      });
    }

    return {
      roomId: memberContext.room._id,
      queueItemId,
      position: queueItems.length,
    };
  },
});

export const removeQueueItem = mutation({
  args: {
    roomId: v.id("rooms"),
    queueItemId: v.id("roomQueueItems"),
  },
  handler: async (ctx, args) => {
    const memberContext = await requireActiveMemberContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, memberContext.room._id),
      getPlaybackStateDoc(ctx, memberContext.room._id),
    ]);
    const queueItem = queueItems.find((item) => item._id === args.queueItemId);
    if (!queueItem) {
      throw new Error("Queue item not found.");
    }

    if (
      !isModeratorRole(memberContext.membership) &&
      queueItem.addedByUserTokenIdentifier !== memberContext.auth.tokenIdentifier
    ) {
      throw new Error("Only the user who enqueued this track can remove it.");
    }

    const now = Date.now();
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      now,
    );
    const currentQueueItemIndex = queueItems.findIndex(
      (item) => item._id === resolvedPlaybackState.currentQueueItemId,
    );

    await ctx.db.patch(queueItem._id, {
      removedAt: now,
    });

    const remainingQueueItems = queueItems.filter(
      (item) => item._id !== queueItem._id,
    );
    await normalizeQueuePositions(ctx, remainingQueueItems);

    if (resolvedPlaybackState.currentQueueItemId !== queueItem._id) {
      return {
        roomId: memberContext.room._id,
        queueItemId: queueItem._id,
      };
    }

    const nextQueueItem =
      currentQueueItemIndex >= 0
        ? remainingQueueItems[currentQueueItemIndex] ?? null
        : remainingQueueItems[0] ?? null;

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId: nextQueueItem?._id ?? null,
      startedAt: nextQueueItem ? now : null,
      startOffsetMs: 0,
      paused: resolvedPlaybackState.paused || !nextQueueItem,
      pausedAt: resolvedPlaybackState.paused || !nextQueueItem ? now : null,
      updatedAt: now,
    });

    return {
      roomId: memberContext.room._id,
      queueItemId: queueItem._id,
      nextQueueItemId: nextQueueItem?._id ?? null,
    };
  },
});

export const moveQueueItem = mutation({
  args: {
    roomId: v.id("rooms"),
    queueItemId: v.id("roomQueueItems"),
    targetIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const moderatorContext = await requireModeratorContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, moderatorContext.room._id),
      getPlaybackStateDoc(ctx, moderatorContext.room._id),
    ]);
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      Date.now(),
    );

    if (resolvedPlaybackState.currentQueueItemId === args.queueItemId) {
      throw new Error("Move the up-next queue, not the room's current track.");
    }

    const reorderedQueueItemIds = moveRoomQueueItemIds(
      queueItems.map((queueItem) => queueItem._id),
      args.queueItemId,
      args.targetIndex,
    );
    const reorderedQueueItems = reorderedQueueItemIds.map((queueItemId) => {
      const queueItem = queueItems.find((item) => item._id === queueItemId);
      if (!queueItem) {
        throw new Error("Queue item not found.");
      }

      return queueItem;
    });

    await normalizeQueuePositions(ctx, reorderedQueueItems);

    return {
      roomId: moderatorContext.room._id,
      queueItemId: args.queueItemId,
      targetIndex: Math.max(
        0,
        Math.min(Math.trunc(args.targetIndex), reorderedQueueItems.length - 1),
      ),
    };
  },
});

export const clearQueue = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const moderatorContext = await requireModeratorContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, moderatorContext.room._id),
      getPlaybackStateDoc(ctx, moderatorContext.room._id),
    ]);
    const now = Date.now();

    for (const queueItem of queueItems) {
      await ctx.db.patch(queueItem._id, {
        removedAt: now,
      });
    }

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId: null,
      startedAt: null,
      startOffsetMs: 0,
      paused: true,
      pausedAt: now,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      removedCount: queueItems.length,
    };
  },
});

export const play = mutation({
  args: {
    roomId: v.id("rooms"),
    queueItemId: v.optional(v.id("roomQueueItems")),
    offsetMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const moderatorContext = await requireModeratorContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, moderatorContext.room._id),
      getPlaybackStateDoc(ctx, moderatorContext.room._id),
    ]);
    const now = Date.now();
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      now,
    );
    const currentQueueItemId =
      args.queueItemId ??
      resolvedPlaybackState.currentQueueItemId ??
      (playbackState.currentQueueItemId === null ? (queueItems[0]?._id ?? null) : null);

    if (!currentQueueItemId) {
      throw new Error("Select a queued track to restart room playback.");
    }

    const currentQueueItem = queueItems.find(
      (queueItem) => queueItem._id === currentQueueItemId,
    );
    if (!currentQueueItem) {
      throw new Error("Queue item not found.");
    }

    const offsetMs = clampPlaybackOffset(
      args.offsetMs ??
        (args.queueItemId ? 0 : resolvedPlaybackState.currentOffsetMs),
      currentQueueItem.trackDurationMs,
    );

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId,
      startedAt: now,
      startOffsetMs: offsetMs,
      paused: false,
      pausedAt: null,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId,
      offsetMs,
    };
  },
});

export const pause = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const moderatorContext = await requireModeratorContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, moderatorContext.room._id),
      getPlaybackStateDoc(ctx, moderatorContext.room._id),
    ]);
    const now = Date.now();
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      now,
    );

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId: resolvedPlaybackState.currentQueueItemId,
      startedAt: resolvedPlaybackState.currentQueueItemId ? now : null,
      startOffsetMs: resolvedPlaybackState.currentOffsetMs,
      paused: true,
      pausedAt: now,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId: resolvedPlaybackState.currentQueueItemId,
      offsetMs: resolvedPlaybackState.currentOffsetMs,
    };
  },
});

export const resume = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const moderatorContext = await requireModeratorContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, moderatorContext.room._id),
      getPlaybackStateDoc(ctx, moderatorContext.room._id),
    ]);
    const now = Date.now();
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      now,
    );
    const currentQueueItemId =
      resolvedPlaybackState.currentQueueItemId;

    if (!currentQueueItemId) {
      throw new Error("There is no active room track to resume.");
    }

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId,
      startedAt: now,
      startOffsetMs: resolvedPlaybackState.currentOffsetMs,
      paused: false,
      pausedAt: null,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId,
      offsetMs: resolvedPlaybackState.currentOffsetMs,
    };
  },
});

export const skip = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const moderatorContext = await requireModeratorContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, moderatorContext.room._id),
      getPlaybackStateDoc(ctx, moderatorContext.room._id),
    ]);
    const now = Date.now();
    const resolvedPlaybackState = resolveRoomPlaybackState(
      queueItems,
      playbackState,
      now,
    );
    const currentQueueItemIndex = queueItems.findIndex(
      (queueItem) => queueItem._id === resolvedPlaybackState.currentQueueItemId,
    );
    const nextQueueItem =
      currentQueueItemIndex >= 0
        ? queueItems[currentQueueItemIndex + 1] ?? null
        : null;

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId: nextQueueItem?._id ?? null,
      startedAt: nextQueueItem ? now : null,
      startOffsetMs: 0,
      paused: resolvedPlaybackState.paused || !nextQueueItem,
      pausedAt: resolvedPlaybackState.paused || !nextQueueItem ? now : null,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId: nextQueueItem?._id ?? null,
    };
  },
});
