import { Presence } from "@convex-dev/presence";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { requireAuthUser } from "./betterAuth";
import {
  moveRoomQueueItemIds,
  normalizeRoomPlaybackForContinuousStream,
  resolveRoomPlaybackState,
} from "../shared/rooms-state";

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
const roomActivityPageSize = 100;
const chatMessageMaxLength = 1_000;

type RoomCtx = QueryCtx | MutationCtx;
type RoomDoc = Doc<"rooms">;
type RoomMembershipDoc = Doc<"roomMemberships">;
type RoomQueueItemDoc = Doc<"roomQueueItems">;
type RoomPlaybackStateDoc = Doc<"roomPlaybackStates">;
type RoomActivityEventDoc = Doc<"roomActivityEvents">;
type UserDoc = Doc<"users">;

type RoomActivityActor = { tokenIdentifier: string; userId: string } | null;
type RoomActivityTrackInput = {
  queueItemId: Id<"roomQueueItems">;
  trackId: string;
  trackName: string;
  trackArtists: string[];
  trackImageUrl?: string | null;
  trackDurationMs: number;
};

const roomPresence = new Presence<string, string>(components.presence);

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

function buildRoomUserSnapshot(userId: string, user: UserDoc | null) {
  return {
    userId,
    name: user?.name ?? userId,
    image: user?.image ?? null,
  };
}

function compareRoomUserNames(
  left: { userId: string; name: string },
  right: { userId: string; name: string },
  viewerUserId: string,
) {
  if (left.userId === viewerUserId) {
    return -1;
  }
  if (right.userId === viewerUserId) {
    return 1;
  }

  return left.name.localeCompare(right.name);
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

function buildActivityTrackSnapshot(event: RoomActivityEventDoc) {
  if (
    !event.queueItemId ||
    !event.trackId ||
    !event.trackName ||
    !event.trackArtists ||
    event.trackDurationMs === undefined
  ) {
    throw new Error("Room activity event is missing track metadata.");
  }

  return {
    queueItemId: event.queueItemId,
    trackId: event.trackId,
    trackName: event.trackName,
    trackArtists: event.trackArtists,
    trackImageUrl: event.trackImageUrl ?? null,
    trackDurationMs: event.trackDurationMs,
  };
}

function buildActivityEventSnapshot(
  event: RoomActivityEventDoc,
  actor: ReturnType<typeof buildRoomUserSnapshot> | null,
) {
  const base = {
    _id: event._id,
    roomId: event.roomId,
    kind: event.kind,
    createdAt: event.createdAt,
    actor,
  };

  switch (event.kind) {
    case "chat_message":
      return {
        ...base,
        kind: "chat_message" as const,
        body: event.body ?? "",
      };
    case "user_entered":
      return {
        ...base,
        kind: "user_entered" as const,
      };
    case "user_left":
      return {
        ...base,
        kind: "user_left" as const,
      };
    case "queue_added":
      return {
        ...base,
        kind: "queue_added" as const,
        track: buildActivityTrackSnapshot(event),
      };
    case "track_started":
      return {
        ...base,
        kind: "track_started" as const,
        track: buildActivityTrackSnapshot(event),
      };
  }
}

function isModeratorRole(roleMembership: RoomMembershipDoc | null) {
  return (
    roleMembership?.role === "owner" || roleMembership?.role === "moderator"
  );
}

function getRoomRoleRank(role: RoomMembershipDoc["role"]) {
  switch (role) {
    case "owner":
      return 0;
    case "moderator":
      return 1;
    case "member":
    default:
      return 2;
  }
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

async function getRoomFollow(
  ctx: RoomCtx,
  roomId: Id<"rooms">,
  userId: string,
) {
  return ctx.db
    .query("roomFollows")
    .withIndex("by_roomId_and_userId", (q) =>
      q.eq("roomId", roomId).eq("userId", userId),
    )
    .unique();
}

async function getUsersByUserId(ctx: RoomCtx, userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds)];
  const users = await Promise.all(
    uniqueUserIds.map((userId) =>
      ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
    ),
  );

  return new Map(uniqueUserIds.map((userId, index) => [userId, users[index] ?? null]));
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

export async function getVisibleRoomContext(
  ctx: RoomCtx,
  roomId: Id<"rooms"> | undefined,
  slug: string | undefined,
) {
  const auth = await requireRoomAuth(ctx);
  const room = await getRoomOrNull(ctx, roomId, slug);
  if (!room) {
    return null;
  }

  const roleMembership = await getActiveMembership(
    ctx,
    room._id,
    auth.tokenIdentifier,
  );
  if (
    room.visibility === "private" &&
    room.ownerUserTokenIdentifier !== auth.tokenIdentifier &&
    !roleMembership
  ) {
    return null;
  }

  return {
    auth,
    room,
    roleMembership,
  };
}

async function requireActiveRoomRoleContext(
  ctx: RoomCtx,
  roomId: Id<"rooms">,
) {
  const auth = await requireRoomAuth(ctx);
  const room = await getRoomOrThrow(ctx, roomId);
  const roleMembership = await getActiveMembership(
    ctx,
    room._id,
    auth.tokenIdentifier,
  );
  if (!roleMembership) {
    throw new Error("You need a room role to do that.");
  }

  return {
    auth,
    room,
    roleMembership,
  };
}

async function requireModeratorContext(ctx: RoomCtx, roomId: Id<"rooms">) {
  const roomRoleContext = await requireActiveRoomRoleContext(ctx, roomId);
  if (!isModeratorRole(roomRoleContext.roleMembership)) {
    throw new Error("Only room owners and moderators can do that.");
  }

  return roomRoleContext;
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

function normalizeChatMessageBody(body: string) {
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    throw new Error("Write a message before sending it.");
  }

  if (trimmedBody.length > chatMessageMaxLength) {
    throw new Error("Keep chat messages under 1,000 characters.");
  }

  return trimmedBody;
}

function buildActivityTrackFields(track: RoomActivityTrackInput) {
  return {
    queueItemId: track.queueItemId,
    trackId: track.trackId,
    trackName: track.trackName,
    trackArtists: track.trackArtists,
    ...(track.trackImageUrl ? { trackImageUrl: track.trackImageUrl } : {}),
    trackDurationMs: track.trackDurationMs,
  };
}

function buildActivityTrackFromQueueItem(
  queueItem: RoomQueueItemDoc,
): RoomActivityTrackInput {
  return {
    queueItemId: queueItem._id,
    trackId: queueItem.trackId,
    trackName: queueItem.trackName,
    trackArtists: queueItem.trackArtists,
    trackImageUrl: queueItem.trackImageUrl ?? null,
    trackDurationMs: queueItem.trackDurationMs,
  };
}

async function insertRoomActivityEventOnce(
  ctx: MutationCtx,
  event: {
    roomId: Id<"rooms">;
    kind: "queue_added" | "track_started" | "user_entered" | "user_left";
    createdAt: number;
    actorUserId: string | null;
    actorUserTokenIdentifier: string | null;
    queueItemId?: Id<"roomQueueItems">;
    trackId?: string;
    trackName?: string;
    trackArtists?: string[];
    trackImageUrl?: string;
    trackDurationMs?: number;
    dedupeKey: string;
  },
) {
  const existingEvent = await ctx.db
    .query("roomActivityEvents")
    .withIndex("by_roomId_and_dedupeKey", (q) =>
      q.eq("roomId", event.roomId).eq("dedupeKey", event.dedupeKey),
    )
    .unique();

  if (existingEvent) {
    return existingEvent._id;
  }

  return ctx.db.insert("roomActivityEvents", event);
}

async function insertQueueAddedActivity(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  actor: RoomActivityActor,
  track: RoomActivityTrackInput,
  createdAt: number,
) {
  return insertRoomActivityEventOnce(ctx, {
    roomId,
    kind: "queue_added",
    createdAt,
    actorUserId: actor?.userId ?? null,
    actorUserTokenIdentifier: actor?.tokenIdentifier ?? null,
    ...buildActivityTrackFields(track),
    dedupeKey: `queue_added:${track.queueItemId}`,
  });
}

export async function insertRoomPresenceActivity(
  ctx: MutationCtx,
  input: {
    roomId: Id<"rooms">;
    actor: Exclude<RoomActivityActor, null>;
    kind: "user_entered" | "user_left";
    createdAt: number;
    sessionToken: string;
  },
) {
  return insertRoomActivityEventOnce(ctx, {
    roomId: input.roomId,
    kind: input.kind,
    createdAt: input.createdAt,
    actorUserId: input.actor.userId,
    actorUserTokenIdentifier: input.actor.tokenIdentifier,
    dedupeKey: `${input.kind}:${input.sessionToken}`,
  });
}

async function insertTrackStartedActivity(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  actor: RoomActivityActor,
  track: RoomActivityTrackInput,
  createdAt: number,
) {
  return insertRoomActivityEventOnce(ctx, {
    roomId,
    kind: "track_started",
    createdAt,
    actorUserId: actor?.userId ?? null,
    actorUserTokenIdentifier: actor?.tokenIdentifier ?? null,
    ...buildActivityTrackFields(track),
    dedupeKey: `track_started:${track.queueItemId}`,
  });
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
    await insertQueueAddedActivity(
      ctx,
      roomId,
      auth,
      {
        queueItemId,
        ...track,
      },
      now,
    );
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
      playedQueueItems: [...queueItems],
      resolvedPlaybackState,
      visibleQueueItems: [] as RoomQueueItemDoc[],
    };
  }

  return {
    currentQueueItem: queueItems[currentQueueItemIndex] ?? null,
    currentQueueItemId: queueItems[currentQueueItemIndex]?._id ?? null,
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
    projection.currentQueueItem &&
    playbackState.currentQueueItemId !== desiredCurrentQueueItemId
  ) {
    await insertTrackStartedActivity(
      ctx,
      playbackState.roomId,
      null,
      buildActivityTrackFromQueueItem(projection.currentQueueItem),
      desiredStartedAt ?? now,
    );
  }

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

async function loadCompactedRoomState<TContext extends { room: RoomDoc }>(
  ctx: MutationCtx,
  roomContextPromise: Promise<TContext>,
  now: number = Date.now(),
) {
  const roomContext = await roomContextPromise;
  const [queueItems, playbackState] = await Promise.all([
    getActiveQueueItems(ctx, roomContext.room._id),
    getPlaybackStateDoc(ctx, roomContext.room._id),
  ]);
  const projection = await compactRoomQueuePlayback(
    ctx,
    playbackState,
    queueItems,
    now,
  );

  return {
    now,
    playbackState,
    projection,
    roomContext,
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
    const [publicRooms, roleMemberships, follows] = await Promise.all([
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
      ctx.db
        .query("roomFollows")
        .withIndex("by_userId", (q) => q.eq("userId", auth.userId))
        .collect(),
    ]);

    const roleRooms = await Promise.all(
      roleMemberships.map((roleMembership) =>
        ctx.db.get(roleMembership.roomId),
      ),
    );

    const roomsById = new Map<Id<"rooms">, RoomDoc>();
    for (const room of publicRooms) {
      roomsById.set(room._id, room);
    }
    for (const room of roleRooms) {
      if (!room || room.archivedAt !== null) {
        continue;
      }

      roomsById.set(room._id, room);
    }

    const roleMembershipsByRoomId = new Map(
      roleMemberships.map((roleMembership) => [
        roleMembership.roomId,
        roleMembership,
      ]),
    );
    const followedRoomIds = new Set(
      follows.map((follow) => follow.roomId),
    );

    return [...roomsById.values()].map((room) => ({
      room: buildRoomSnapshot(room),
      viewerFollowsRoom: followedRoomIds.has(room._id),
      viewerMembership: buildMembershipSnapshot(
        roleMembershipsByRoomId.get(room._id) ?? null,
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

    const [queueItems, playbackState, activeRoleMemberships, follow] =
      await Promise.all([
        getActiveQueueItems(ctx, visibleRoomContext.room._id),
        getPlaybackStateDoc(ctx, visibleRoomContext.room._id),
        getActiveRoomMemberships(ctx, visibleRoomContext.room._id),
        getRoomFollow(
          ctx,
          visibleRoomContext.room._id,
          visibleRoomContext.auth.userId,
        ),
    ]);
    const projection = resolveRoomPlaybackProjection(
      queueItems,
      playbackState,
      Date.now(),
    );
    const roleMembershipsByUserId = activeRoleMemberships.reduce<
      Map<string, RoomMembershipDoc>
    >((memberships, membership) => {
      const existingMembership = memberships.get(membership.userId);
      if (
        !existingMembership ||
        getRoomRoleRank(membership.role) <
          getRoomRoleRank(existingMembership.role) ||
        (membership.role === existingMembership.role &&
          membership.joinedAt < existingMembership.joinedAt)
      ) {
        memberships.set(membership.userId, membership);
      }

      return memberships;
    }, new Map());

    const [presentUsersInRoom, roleHolders] = await Promise.all([
      roomPresence.listRoom(ctx, visibleRoomContext.room._id, true),
      Promise.resolve([...roleMembershipsByUserId.values()]),
    ]);
    const usersByUserId = await getUsersByUserId(ctx, [
      ...roleHolders.map((roleMembership) => roleMembership.userId),
      ...presentUsersInRoom.map((presentUser) => presentUser.userId),
    ]);
    const presentUsers = presentUsersInRoom
      .map((presentUser) =>
        buildRoomUserSnapshot(
          presentUser.userId,
          usersByUserId.get(presentUser.userId) ?? null,
        ),
      )
      .sort((left, right) =>
        compareRoomUserNames(left, right, visibleRoomContext.auth.userId),
      );
    const sortedRoleHolders = roleHolders
      .map((roleMembership) => ({
        ...buildRoomUserSnapshot(
          roleMembership.userId,
          usersByUserId.get(roleMembership.userId) ?? null,
        ),
        role: roleMembership.role,
      }))
      .sort((left, right) => {
        const roleDelta = getRoomRoleRank(left.role) - getRoomRoleRank(right.role);
        if (roleDelta !== 0) {
          return roleDelta;
        }

        return compareRoomUserNames(
          left,
          right,
          visibleRoomContext.auth.userId,
        );
      });

    return {
      room: buildRoomSnapshot(visibleRoomContext.room),
      viewerFollowsRoom: !!follow,
      viewerMembership: buildMembershipSnapshot(
        visibleRoomContext.roleMembership,
      ),
      memberCount: sortedRoleHolders.length,
      presentCount: presentUsers.length,
      presentUsers,
      roleHolders: sortedRoleHolders,
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
        canEnqueue: !!visibleRoomContext.roleMembership,
        canManageQueue: isModeratorRole(visibleRoomContext.roleMembership),
        canControlPlayback: isModeratorRole(visibleRoomContext.roleMembership),
      },
    };
  },
});

export const listActivity = query({
  args: {
    roomId: v.id("rooms"),
    since: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const visibleRoomContext = await getVisibleRoomContext(
      ctx,
      args.roomId,
      undefined,
    );
    if (!visibleRoomContext) {
      return [];
    }

    const limit = Math.max(
      1,
      Math.min(Math.trunc(args.limit ?? roomActivityPageSize), roomActivityPageSize),
    );
    const since = Number.isFinite(args.since) ? args.since : Date.now();
    const events = await ctx.db
      .query("roomActivityEvents")
      .withIndex("by_roomId_and_createdAt", (q) =>
        q.eq("roomId", visibleRoomContext.room._id).gt("createdAt", since),
      )
      .order("asc")
      .take(limit);
    const actorUserIds = events.flatMap((event) =>
      event.actorUserId ? [event.actorUserId] : [],
    );
    const usersByUserId = await getUsersByUserId(ctx, actorUserIds);

    return events.map((event) =>
      buildActivityEventSnapshot(
        event,
        event.actorUserId
          ? buildRoomUserSnapshot(
              event.actorUserId,
              usersByUserId.get(event.actorUserId) ?? null,
            )
          : null,
      ),
    );
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

    await ctx.db.insert("roomMemberships", {
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
      slug,
    };
  },
});

export const follow = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const visibleRoomContext = await getVisibleRoomContext(
      ctx,
      args.roomId,
      undefined,
    );
    if (!visibleRoomContext) {
      throw new Error("Room not found.");
    }

    const existingFollow = await getRoomFollow(
      ctx,
      visibleRoomContext.room._id,
      visibleRoomContext.auth.userId,
    );
    if (existingFollow) {
      return {
        roomId: visibleRoomContext.room._id,
        followId: existingFollow._id,
      };
    }

    const followId = await ctx.db.insert("roomFollows", {
      roomId: visibleRoomContext.room._id,
      userId: visibleRoomContext.auth.userId,
      followedAt: Date.now(),
    });

    return {
      roomId: visibleRoomContext.room._id,
      followId,
    };
  },
});

export const unfollow = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const auth = await requireRoomAuth(ctx);
    const existingFollow = await getRoomFollow(ctx, args.roomId, auth.userId);
    if (!existingFollow) {
      return {
        roomId: args.roomId,
        unfollowed: false,
      };
    }

    await ctx.db.delete(existingFollow._id);

    return {
      roomId: args.roomId,
      unfollowed: true,
    };
  },
});

export const sendChatMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const visibleRoomContext = await getVisibleRoomContext(
      ctx,
      args.roomId,
      undefined,
    );
    if (!visibleRoomContext) {
      throw new Error("Room not found.");
    }

    const now = Date.now();
    const body = normalizeChatMessageBody(args.body);
    const eventId = await ctx.db.insert("roomActivityEvents", {
      roomId: visibleRoomContext.room._id,
      kind: "chat_message",
      createdAt: now,
      actorUserId: visibleRoomContext.auth.userId,
      actorUserTokenIdentifier: visibleRoomContext.auth.tokenIdentifier,
      body,
      dedupeKey: `chat_message:${visibleRoomContext.auth.tokenIdentifier}:${now}`,
    });

    return {
      roomId: visibleRoomContext.room._id,
      eventId,
    };
  },
});

export const recordCurrentTrackStarted = mutation({
  args: {
    roomId: v.id("rooms"),
    queueItemId: v.id("roomQueueItems"),
  },
  handler: async (ctx, args) => {
    const visibleRoomContext = await getVisibleRoomContext(
      ctx,
      args.roomId,
      undefined,
    );
    if (!visibleRoomContext) {
      throw new Error("Room not found.");
    }

    const now = Date.now();
    const [queueItems, playbackState] = await Promise.all([
      getActiveQueueItems(ctx, visibleRoomContext.room._id),
      getPlaybackStateDoc(ctx, visibleRoomContext.room._id),
    ]);
    const projection = resolveRoomPlaybackProjection(
      queueItems,
      playbackState,
      now,
    );
    if (projection.currentQueueItem?._id !== args.queueItemId) {
      return {
        roomId: visibleRoomContext.room._id,
        queueItemId: args.queueItemId,
        recorded: false,
      };
    }

    const eventId = await insertTrackStartedActivity(
      ctx,
      visibleRoomContext.room._id,
      null,
      buildActivityTrackFromQueueItem(projection.currentQueueItem),
      projection.resolvedPlaybackState.startedAt ?? now,
    );

    return {
      roomId: visibleRoomContext.room._id,
      queueItemId: args.queueItemId,
      eventId,
      recorded: true,
    };
  },
});

export const enqueueTrack = mutation({
  args: enqueueTrackArgsValidator,
  handler: async (ctx, args) => {
    const { now, playbackState, projection, roomContext: roleContext } =
      await loadCompactedRoomState(
        ctx,
        requireActiveRoomRoleContext(ctx, args.roomId),
      );
    const track = normalizeQueuedTrack(args);
    const [queueItemId] = await insertQueuedTracks(
      ctx,
      roleContext.room._id,
      roleContext.auth,
      [track],
      projection.queueItems.length,
      now,
    );
    if (!queueItemId) {
      throw new Error("Track could not be queued.");
    }

    if (projection.queueItems.length === 0) {
      await syncRoomPlaybackState(ctx, playbackState, {
        currentQueueItemId: queueItemId,
        startedAt: now,
        startOffsetMs: 0,
        paused: false,
        pausedAt: null,
        updatedAt: now,
      });
      await insertTrackStartedActivity(
        ctx,
        roleContext.room._id,
        roleContext.auth,
        {
          queueItemId,
          ...track,
        },
        now,
      );
    }

    return {
      roomId: roleContext.room._id,
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

    const { now, playbackState, projection, roomContext: roleContext } =
      await loadCompactedRoomState(
        ctx,
        requireActiveRoomRoleContext(ctx, args.roomId),
      );
    const tracks = args.tracks.map((track) => normalizeQueuedTrack(track));
    const queueItemIds = await insertQueuedTracks(
      ctx,
      roleContext.room._id,
      roleContext.auth,
      tracks,
      projection.queueItems.length,
      now,
    );

    if (projection.queueItems.length === 0 && queueItemIds[0] && tracks[0]) {
      await syncRoomPlaybackState(ctx, playbackState, {
        currentQueueItemId: queueItemIds[0] ?? null,
        startedAt: now,
        startOffsetMs: 0,
        paused: false,
        pausedAt: null,
        updatedAt: now,
      });
      await insertTrackStartedActivity(
        ctx,
        roleContext.room._id,
        roleContext.auth,
        {
          queueItemId: queueItemIds[0],
          ...tracks[0],
        },
        now,
      );
    }

    return {
      count: queueItemIds.length,
      roomId: roleContext.room._id,
    };
  },
});

export const removeQueueItem = mutation({
  args: {
    roomId: v.id("rooms"),
    queueItemId: v.id("roomQueueItems"),
  },
  handler: async (ctx, args) => {
    const { now, projection, roomContext: roleContext } =
      await loadCompactedRoomState(
        ctx,
        requireActiveRoomRoleContext(ctx, args.roomId),
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
      !isModeratorRole(roleContext.roleMembership) &&
      queueItem.addedByUserTokenIdentifier !== roleContext.auth.tokenIdentifier
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
      roomId: roleContext.room._id,
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
    const { projection, roomContext: moderatorContext } =
      await loadCompactedRoomState(ctx, requireModeratorContext(ctx, args.roomId));

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
    const { now, playbackState, projection, roomContext: moderatorContext } =
      await loadCompactedRoomState(ctx, requireModeratorContext(ctx, args.roomId));

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
    const { now, playbackState, projection, roomContext: moderatorContext } =
      await loadCompactedRoomState(ctx, requireModeratorContext(ctx, args.roomId));
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

    if (projection.currentQueueItemId !== currentQueueItemId) {
      await insertTrackStartedActivity(
        ctx,
        moderatorContext.room._id,
        moderatorContext.auth,
        buildActivityTrackFromQueueItem(currentQueueItem),
        now,
      );
    }

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
    const { now, playbackState, projection, roomContext: moderatorContext } =
      await loadCompactedRoomState(ctx, requireModeratorContext(ctx, args.roomId));
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
    const { now, playbackState, projection, roomContext: moderatorContext } =
      await loadCompactedRoomState(ctx, requireModeratorContext(ctx, args.roomId));
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
    const { now, playbackState, projection, roomContext: moderatorContext } =
      await loadCompactedRoomState(ctx, requireModeratorContext(ctx, args.roomId));
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

    if (nextQueueItem) {
      await insertTrackStartedActivity(
        ctx,
        moderatorContext.room._id,
        moderatorContext.auth,
        buildActivityTrackFromQueueItem(nextQueueItem),
        now,
      );
    }

    return {
      roomId: moderatorContext.room._id,
      currentQueueItemId: nextQueueItem?._id ?? null,
    };
  },
});
