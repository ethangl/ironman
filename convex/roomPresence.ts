import { Presence } from "@convex-dev/presence";
import { v } from "convex/values";

import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { getVisibleRoomContext } from "./rooms";

const roomPresence = new Presence<string, string>(components.presence);

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

    return roomPresence.heartbeat(
      ctx,
      visibleRoomContext.room._id,
      visibleRoomContext.auth.userId,
      args.sessionId,
      args.interval,
    );
  },
});

export const disconnect = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    return roomPresence.disconnect(ctx, args.sessionToken);
  },
});
