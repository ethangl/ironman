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
  normalizeRoomPlaybackForContinuousStream,
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
const queuedTrackValidator = v.object({
  trackId: v.string(),
  trackName: v.string(),
  trackArtists: v.array(v.string()),
  trackImageUrl: v.optional(v.string()),
  trackDurationMs: v.number(),
});

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

function buildQueueItemSnapshot(
  queueItem: RoomQueueItemDoc,
  position: number = queueItem.position,
) {
  return {
    _id: queueItem._id,
    roomId: queueItem.roomId,
    position,
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

function hasStartedRoomPlayback(
  playbackState: Pick<RoomPlaybackStateDoc, "currentQueueItemId" | "startedAt">,
) {
  return playbackState.currentQueueItemId !== null || playbackState.startedAt !== null;
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

function normalizeQueuedTrack(input: {
  trackId: string;
  trackName: string;
  trackArtists: string[];
  trackImageUrl?: string;
  trackDurationMs: number;
}) {
  const trackId = input.trackId.trim();
  const trackName = input.trackName.trim();
  if (!trackId || !trackName) {
    throw new Error("Tracks need both an id and a name.");
  }

  if (input.trackDurationMs <= 0) {
    throw new Error("Track duration must be greater than zero.");
  }

  return {
    trackArtists: input.trackArtists,
    trackDurationMs: input.trackDurationMs,
    trackId,
    trackImageUrl: input.trackImageUrl,
    trackName,
  };
}

async function insertQueuedTracks(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  auth: { tokenIdentifier: string; userId: string },
  tracks: Array<{
    trackId: string;
    trackName: string;
    trackArtists: string[];
    trackImageUrl?: string;
    trackDurationMs: number;
  }>,
  startPosition: number,
  now: number,
) {
  const queueItemIds: Id<"roomQueueItems">[] = [];

  for (const [index, track] of tracks.entries()) {
    const queueItemId = await ctx.db.insert("roomQueueItems", {
      roomId,
      position: startPosition + index,
      trackId: track.trackId,
      trackName: track.trackName,
      trackArtists: track.trackArtists,
      ...(track.trackImageUrl ? { trackImageUrl: track.trackImageUrl } : {}),
      trackDurationMs: track.trackDurationMs,
      addedByUserId: auth.userId,
      addedByUserTokenIdentifier: auth.tokenIdentifier,
      addedAt: now,
      removedAt: null,
    });
    queueItemIds.push(queueItemId);
  }

  return queueItemIds;
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

function resolveRoomPlaybackProjection(
  queueItems: readonly RoomQueueItemDoc[],
  playbackState: Pick<
    RoomPlaybackStateDoc,
    "currentQueueItemId" | "startedAt" | "startOffsetMs" | "paused" | "pausedAt"
  >,
  now: number,
) {
  const effectivePlaybackState = normalizeRoomPlaybackForContinuousStream(
    queueItems,
    playbackState,
    now,
  );
  const resolvedPlaybackState = resolveRoomPlaybackState(
    queueItems,
    effectivePlaybackState,
    now,
  );

  if (!hasStartedRoomPlayback(effectivePlaybackState)) {
    return {
      currentQueueItem: null,
      currentQueueItemId: null,
      currentQueueItemIndex: -1,
      playedQueueItems: [] as RoomQueueItemDoc[],
      resolvedPlaybackState,
      visibleQueueItems: [...queueItems],
    };
  }

  const currentQueueItemIndex = queueItems.findIndex(
    (queueItem) => queueItem._id === resolvedPlaybackState.currentQueueItemId,
  );

  if (currentQueueItemIndex < 0) {
    return {
      currentQueueItem: null,
      currentQueueItemId: null,
      currentQueueItemIndex: -1,
      playedQueueItems: [...queueItems],
      resolvedPlaybackState,
      visibleQueueItems: [] as RoomQueueItemDoc[],
    };
  }

  return {
    currentQueueItem: queueItems[currentQueueItemIndex] ?? null,
    currentQueueItemId: queueItems[currentQueueItemIndex]?._id ?? null,
    currentQueueItemIndex,
    playedQueueItems: queueItems.slice(0, currentQueueItemIndex),
    resolvedPlaybackState,
    visibleQueueItems: queueItems.slice(currentQueueItemIndex + 1),
  };
}

async function compactRoomQueuePlayback(
  ctx: MutationCtx,
  playbackState: RoomPlaybackStateDoc,
  queueItems: readonly RoomQueueItemDoc[],
  now: number,
) {
  const projection = resolveRoomPlaybackProjection(queueItems, playbackState, now);

  if (!hasStartedRoomPlayback(playbackState)) {
    return {
      ...projection,
      queueItems: [...queueItems],
    };
  }

  for (const playedQueueItem of projection.playedQueueItems) {
    await ctx.db.patch(playedQueueItem._id, {
      removedAt: now,
    });
  }

  const retainedQueueItems = projection.currentQueueItem
    ? [projection.currentQueueItem, ...projection.visibleQueueItems]
    : [];
  await normalizeQueuePositions(ctx, retainedQueueItems);

  const desiredCurrentQueueItemId = projection.currentQueueItem?._id ?? null;
  const desiredStartedAt = projection.currentQueueItem
    ? projection.resolvedPlaybackState.startedAt
    : null;
  const desiredStartOffsetMs = projection.currentQueueItem
    ? projection.resolvedPlaybackState.startOffsetMs
    : 0;
  const desiredPaused = projection.currentQueueItem
    ? projection.resolvedPlaybackState.paused
    : true;
  const desiredPausedAt = projection.currentQueueItem
    ? projection.resolvedPlaybackState.pausedAt
    : now;

  if (
    playbackState.currentQueueItemId !== desiredCurrentQueueItemId ||
    playbackState.startedAt !== desiredStartedAt ||
    playbackState.startOffsetMs !== desiredStartOffsetMs ||
    playbackState.paused !== desiredPaused ||
    playbackState.pausedAt !== desiredPausedAt
  ) {
    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId: desiredCurrentQueueItemId,
      startedAt: desiredStartedAt,
      startOffsetMs: desiredStartOffsetMs,
      paused: desiredPaused,
      pausedAt: desiredPausedAt,
      updatedAt: now,
    });
  }

  return {
    ...projection,
    currentQueueItemIndex: projection.currentQueueItem ? 0 : -1,
    currentQueueItemId: desiredCurrentQueueItemId,
    queueItems: retainedQueueItems,
    resolvedPlaybackState: {
      ...projection.resolvedPlaybackState,
      currentQueueItemId: desiredCurrentQueueItemId,
      startedAt: desiredStartedAt,
      startOffsetMs: desiredStartOffsetMs,
      paused: desiredPaused,
      pausedAt: desiredPausedAt,
      currentOffsetMs: projection.currentQueueItem
        ? projection.resolvedPlaybackState.currentOffsetMs
        : 0,
    },
    visibleQueueItems: projection.currentQueueItem
      ? retainedQueueItems.slice(1)
      : retainedQueueItems,
  };
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
    const projection = resolveRoomPlaybackProjection(
      queueItems,
      playbackState,
      Date.now(),
    );

    return {
      room: buildRoomSnapshot(visibleRoomContext.room),
      viewerMembership: buildMembershipSnapshot(visibleRoomContext.membership),
      memberCount: activeMemberships.length,
      queueLength: projection.visibleQueueItems.length,
      queue: projection.visibleQueueItems.map((queueItem, index) =>
        buildQueueItemSnapshot(queueItem, index),
      ),
      playback: {
        currentQueueItemId: projection.currentQueueItemId,
        currentQueueItem: projection.currentQueueItem
          ? buildQueueItemSnapshot(projection.currentQueueItem)
          : null,
        startedAt: projection.currentQueueItem
          ? projection.resolvedPlaybackState.startedAt
          : null,
        startOffsetMs: projection.currentQueueItem
          ? projection.resolvedPlaybackState.startOffsetMs
          : 0,
        paused: projection.currentQueueItem
          ? projection.resolvedPlaybackState.paused
          : true,
        pausedAt: projection.currentQueueItem
          ? projection.resolvedPlaybackState.pausedAt
          : playbackState.pausedAt,
        updatedAt: playbackState.updatedAt,
        canEnqueue: !!visibleRoomContext.membership,
        canManageQueue: isModeratorRole(visibleRoomContext.membership),
        canControlPlayback: isModeratorRole(visibleRoomContext.membership),
      },
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
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, memberContext.room._id),
      getPlaybackStateDoc(ctx, memberContext.room._id),
    ]);
    const now = Date.now();
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );
    const [queueItemId] = await insertQueuedTracks(
      ctx,
      memberContext.room._id,
      memberContext.auth,
      [normalizeQueuedTrack(args)],
      projection.queueItems.length,
      now,
    );

    if (projection.queueItems.length === 0) {
      await syncRoomPlaybackState(ctx, playbackState, {
        currentQueueItemId: queueItemId,
        startedAt: now,
        startOffsetMs: 0,
        paused: false,
        pausedAt: null,
        updatedAt: now,
      });
    }

    return {
      roomId: memberContext.room._id,
      queueItemId,
      position: projection.visibleQueueItems.length,
    };
  },
});

export const enqueueTracks = mutation({
  args: {
    roomId: v.id("rooms"),
    tracks: v.array(queuedTrackValidator),
  },
  handler: async (ctx, args) => {
    if (args.tracks.length === 0) {
      throw new Error("Add at least one track to queue a playlist.");
    }

    const memberContext = await requireActiveMemberContext(ctx, args.roomId);
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, memberContext.room._id),
      getPlaybackStateDoc(ctx, memberContext.room._id),
    ]);
    const now = Date.now();
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );
    const queueItemIds = await insertQueuedTracks(
      ctx,
      memberContext.room._id,
      memberContext.auth,
      args.tracks.map((track) => normalizeQueuedTrack(track)),
      projection.queueItems.length,
      now,
    );

    if (projection.queueItems.length === 0) {
      await syncRoomPlaybackState(ctx, playbackState, {
        currentQueueItemId: queueItemIds[0] ?? null,
        startedAt: now,
        startOffsetMs: 0,
        paused: false,
        pausedAt: null,
        updatedAt: now,
      });
    }

    return {
      count: queueItemIds.length,
      roomId: memberContext.room._id,
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
    const now = Date.now();
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );
    const queueItem = projection.visibleQueueItems.find(
      (item) => item._id === args.queueItemId,
    );
    if (!queueItem) {
      if (projection.currentQueueItem?._id === args.queueItemId) {
        throw new Error("Remove tracks from the up-next queue, not the current track.");
      }

      throw new Error("Queue item not found.");
    }

    if (
      !isModeratorRole(memberContext.membership) &&
      queueItem.addedByUserTokenIdentifier !== memberContext.auth.tokenIdentifier
    ) {
      throw new Error("Only the user who enqueued this track can remove it.");
    }

    await ctx.db.patch(queueItem._id, {
      removedAt: now,
    });

    const remainingVisibleQueueItems = projection.visibleQueueItems.filter(
      (item) => item._id !== queueItem._id,
    );
    await normalizeQueuePositions(
      ctx,
      projection.currentQueueItem
        ? [projection.currentQueueItem, ...remainingVisibleQueueItems]
        : remainingVisibleQueueItems,
    );

    return {
      roomId: memberContext.room._id,
      queueItemId: queueItem._id,
      nextQueueItemId: remainingVisibleQueueItems[0]?._id ?? null,
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
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      Date.now(),
    );

    const reorderedQueueItemIds = moveRoomQueueItemIds(
      projection.visibleQueueItems.map((queueItem) => queueItem._id),
      args.queueItemId,
      args.targetIndex,
    );
    const reorderedQueueItems = reorderedQueueItemIds.map((queueItemId) => {
      const queueItem = projection.visibleQueueItems.find(
        (item) => item._id === queueItemId,
      );
      if (!queueItem) {
        throw new Error("Queue item not found.");
      }

      return queueItem;
    });

    await normalizeQueuePositions(
      ctx,
      projection.currentQueueItem
        ? [projection.currentQueueItem, ...reorderedQueueItems]
        : reorderedQueueItems,
    );

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
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );

    for (const queueItem of projection.visibleQueueItems) {
      await ctx.db.patch(queueItem._id, {
        removedAt: now,
      });
    }

    if (!projection.currentQueueItem) {
      await syncRoomPlaybackState(ctx, playbackState, {
        currentQueueItemId: null,
        startedAt: null,
        startOffsetMs: 0,
        paused: true,
        pausedAt: now,
        updatedAt: now,
      });
    }

    return {
      roomId: moderatorContext.room._id,
      removedCount: projection.visibleQueueItems.length,
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
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );
    const playbackQueueItems = projection.currentQueueItem
      ? [projection.currentQueueItem, ...projection.visibleQueueItems]
      : projection.visibleQueueItems;
    const currentQueueItemId =
      args.queueItemId ??
      projection.currentQueueItem?._id ??
      (playbackQueueItems[0]?._id ?? null);

    if (!currentQueueItemId) {
      throw new Error("Select a queued track to restart room playback.");
    }

    const currentQueueItemIndex = playbackQueueItems.findIndex(
      (queueItem) => queueItem._id === currentQueueItemId,
    );
    const currentQueueItem =
      currentQueueItemIndex >= 0
        ? playbackQueueItems[currentQueueItemIndex] ?? null
        : null;

    if (!currentQueueItem) {
      throw new Error("Queue item not found.");
    }

    const offsetMs = clampPlaybackOffset(
      args.offsetMs ??
        (projection.currentQueueItem?._id === currentQueueItemId
          ? projection.resolvedPlaybackState.currentOffsetMs
          : 0),
      currentQueueItem.trackDurationMs,
    );

    for (const skippedQueueItem of playbackQueueItems.slice(0, currentQueueItemIndex)) {
      await ctx.db.patch(skippedQueueItem._id, {
        removedAt: now,
      });
    }

    await normalizeQueuePositions(ctx, playbackQueueItems.slice(currentQueueItemIndex));

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
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );
    const currentQueueItemId = projection.currentQueueItemId;

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId,
      startedAt: currentQueueItemId ? now : null,
      startOffsetMs: currentQueueItemId
        ? projection.resolvedPlaybackState.currentOffsetMs
        : 0,
      paused: true,
      pausedAt: now,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId,
      offsetMs: projection.currentQueueItem
        ? projection.resolvedPlaybackState.currentOffsetMs
        : 0,
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
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );
    const currentQueueItemId = projection.currentQueueItemId;

    if (!currentQueueItemId) {
      throw new Error("There is no active room track to resume.");
    }

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId,
      startedAt: now,
      startOffsetMs: projection.resolvedPlaybackState.currentOffsetMs,
      paused: false,
      pausedAt: null,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId,
      offsetMs: projection.resolvedPlaybackState.currentOffsetMs,
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
    const projection = await compactRoomQueuePlayback(
      ctx,
      playbackState,
      queueItems,
      now,
    );
    const nextQueueItem = projection.visibleQueueItems[0] ?? null;

    if (projection.currentQueueItem) {
      await ctx.db.patch(projection.currentQueueItem._id, {
        removedAt: now,
      });
    }

    await normalizeQueuePositions(
      ctx,
      nextQueueItem
        ? [nextQueueItem, ...projection.visibleQueueItems.slice(1)]
        : [],
    );

    await syncRoomPlaybackState(ctx, playbackState, {
      currentQueueItemId: nextQueueItem?._id ?? null,
      startedAt: nextQueueItem ? now : null,
      startOffsetMs: 0,
      paused: projection.resolvedPlaybackState.paused || !nextQueueItem,
      pausedAt:
        projection.resolvedPlaybackState.paused || !nextQueueItem ? now : null,
      updatedAt: now,
    });

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId: nextQueueItem?._id ?? null,
    };
  },
});
