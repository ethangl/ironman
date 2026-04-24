import { Presence } from "@convex-dev/presence";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { getVisibleRoomContext, insertRoomPresenceActivity } from "./rooms";

const roomPresence = new Presence<string, string>(components.presence);

type RoomPresenceSessionDoc = Doc<"roomPresenceSessions">;

async function getActiveTrackedPresenceSessions(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  userId: string,
) {
  return ctx.db
    .query("roomPresenceSessions")
    .withIndex("by_roomId_and_userId_and_leftAt", (q) =>
      q.eq("roomId", roomId).eq("userId", userId).eq("leftAt", null),
    )
    .collect();
}

async function getTrackedPresenceSession(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  userId: string,
  sessionId: string,
) {
  return ctx.db
    .query("roomPresenceSessions")
    .withIndex("by_roomId_and_userId_and_sessionId", (q) =>
      q.eq("roomId", roomId).eq("userId", userId).eq("sessionId", sessionId),
    )
    .unique();
}

async function isUserOnlineInRoom(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  userId: string,
) {
  const onlineUsers = await roomPresence.listRoom(ctx, roomId, true);
  return onlineUsers.some((onlineUser) => onlineUser.userId === userId);
}

async function closeTrackedPresenceSessions(
  ctx: MutationCtx,
  sessions: RoomPresenceSessionDoc[],
  leftAt: number,
) {
  for (const session of sessions) {
    if (session.leftAt !== null) {
      continue;
    }

    await ctx.db.patch(session._id, { leftAt });
  }
}

export const heartbeat = mutation({
  args: {
    roomId: v.id("rooms"),
    sessionId: v.string(),
    interval: v.number(),
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
    const trackedSession = await getTrackedPresenceSession(
      ctx,
      visibleRoomContext.room._id,
      visibleRoomContext.auth.userId,
      args.sessionId,
    );
    const isSilentResume = trackedSession?.leftAt === null;
    const wasOnline = await isUserOnlineInRoom(
      ctx,
      visibleRoomContext.room._id,
      visibleRoomContext.auth.userId,
    );
    if (!wasOnline && !isSilentResume) {
      await closeTrackedPresenceSessions(
        ctx,
        await getActiveTrackedPresenceSessions(
          ctx,
          visibleRoomContext.room._id,
          visibleRoomContext.auth.userId,
        ),
        now,
      );
    }

    const result = await roomPresence.heartbeat(
      ctx,
      visibleRoomContext.room._id,
      visibleRoomContext.auth.userId,
      args.sessionId,
      args.interval,
    );

    if (!trackedSession) {
      await ctx.db.insert("roomPresenceSessions", {
        roomId: visibleRoomContext.room._id,
        userId: visibleRoomContext.auth.userId,
        userTokenIdentifier: visibleRoomContext.auth.tokenIdentifier,
        sessionId: args.sessionId,
        sessionToken: result.sessionToken,
        enteredAt: now,
        leftAt: null,
      });
    } else if (
      trackedSession.sessionToken !== result.sessionToken ||
      trackedSession.leftAt !== null
    ) {
      await ctx.db.patch(trackedSession._id, {
        sessionToken: result.sessionToken,
        leftAt: null,
      });
    }

    const activeSessions = await getActiveTrackedPresenceSessions(
      ctx,
      visibleRoomContext.room._id,
      visibleRoomContext.auth.userId,
    );
    if (!wasOnline && !isSilentResume && activeSessions.length === 1) {
      await insertRoomPresenceActivity(ctx, {
        roomId: visibleRoomContext.room._id,
        actor: visibleRoomContext.auth,
        kind: "user_entered",
        createdAt: now,
        sessionToken: result.sessionToken,
      });
    }

    return result;
  },
});

export const disconnect = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const trackedSession = await ctx.db
      .query("roomPresenceSessions")
      .withIndex("by_sessionToken", (q) =>
        q.eq("sessionToken", args.sessionToken),
      )
      .unique();
    const wasOnline =
      trackedSession?.leftAt === null
        ? await isUserOnlineInRoom(ctx, trackedSession.roomId, trackedSession.userId)
        : false;

    const result = await roomPresence.disconnect(ctx, args.sessionToken);

    if (!trackedSession || trackedSession.leftAt !== null) {
      return result;
    }

    const now = Date.now();
    await ctx.db.patch(trackedSession._id, { leftAt: now });
    const isOnline = await isUserOnlineInRoom(
      ctx,
      trackedSession.roomId,
      trackedSession.userId,
    );

    if (wasOnline && !isOnline) {
      await insertRoomPresenceActivity(ctx, {
        roomId: trackedSession.roomId,
        actor: {
          tokenIdentifier: trackedSession.userTokenIdentifier,
          userId: trackedSession.userId,
        },
        kind: "user_left",
        createdAt: now,
        sessionToken: trackedSession.sessionToken,
      });
    }

    return result;
  },
});
