import { FunctionSpec, GroupSpec } from "@confect/core";

import type {
  clearQueue,
  create,
  enqueueTrack,
  enqueueTracks,
  follow,
  get,
  list,
  listActivity,
  moveQueueItem,
  pause,
  play,
  recordCurrentTrackStarted,
  removeQueueItem,
  resume,
  sendChatMessage,
  skip,
  unfollow,
} from "./rooms";

/**
 * The rooms group, ported from `convex/rooms.ts`. These are PLAIN Convex
 * queries/mutations (registered via confect's `convex*` spec constructors) —
 * the natural fit for DB-heavy CRUD coupled to the Presence component, which
 * needs a raw Convex ctx. Arg/return types are extracted from the Convex
 * function types, so the client sees the same types as before (no Effect
 * `returns` schema needed). The logic, including the pure `shared/rooms-state`
 * projection, is unchanged.
 */
export const rooms = GroupSpec.make("rooms")
  .addFunction(FunctionSpec.convexPublicQuery<typeof list>()("list"))
  .addFunction(FunctionSpec.convexPublicQuery<typeof get>()("get"))
  .addFunction(
    FunctionSpec.convexPublicQuery<typeof listActivity>()("listActivity"),
  )
  .addFunction(FunctionSpec.convexPublicMutation<typeof create>()("create"))
  .addFunction(FunctionSpec.convexPublicMutation<typeof follow>()("follow"))
  .addFunction(FunctionSpec.convexPublicMutation<typeof unfollow>()("unfollow"))
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof sendChatMessage>()(
      "sendChatMessage",
    ),
  )
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof recordCurrentTrackStarted>()(
      "recordCurrentTrackStarted",
    ),
  )
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof enqueueTrack>()("enqueueTrack"),
  )
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof enqueueTracks>()("enqueueTracks"),
  )
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof removeQueueItem>()(
      "removeQueueItem",
    ),
  )
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof moveQueueItem>()("moveQueueItem"),
  )
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof clearQueue>()("clearQueue"),
  )
  .addFunction(FunctionSpec.convexPublicMutation<typeof play>()("play"))
  .addFunction(FunctionSpec.convexPublicMutation<typeof pause>()("pause"))
  .addFunction(FunctionSpec.convexPublicMutation<typeof resume>()("resume"))
  .addFunction(FunctionSpec.convexPublicMutation<typeof skip>()("skip"));
