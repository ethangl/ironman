import { FunctionImpl, GroupImpl } from "@confect/server";
import { Layer } from "effect";

import api from "./_generated/api";
import {
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

/** For plain Convex functions the impl IS the Convex function value. */
const fns = Layer.mergeAll(
  FunctionImpl.make(api, "rooms", "list", list),
  FunctionImpl.make(api, "rooms", "get", get),
  FunctionImpl.make(api, "rooms", "listActivity", listActivity),
  FunctionImpl.make(api, "rooms", "create", create),
  FunctionImpl.make(api, "rooms", "follow", follow),
  FunctionImpl.make(api, "rooms", "unfollow", unfollow),
  FunctionImpl.make(api, "rooms", "sendChatMessage", sendChatMessage),
  FunctionImpl.make(
    api,
    "rooms",
    "recordCurrentTrackStarted",
    recordCurrentTrackStarted,
  ),
  FunctionImpl.make(api, "rooms", "enqueueTrack", enqueueTrack),
  FunctionImpl.make(api, "rooms", "enqueueTracks", enqueueTracks),
  FunctionImpl.make(api, "rooms", "removeQueueItem", removeQueueItem),
  FunctionImpl.make(api, "rooms", "moveQueueItem", moveQueueItem),
  FunctionImpl.make(api, "rooms", "clearQueue", clearQueue),
  FunctionImpl.make(api, "rooms", "play", play),
  FunctionImpl.make(api, "rooms", "pause", pause),
  FunctionImpl.make(api, "rooms", "resume", resume),
  FunctionImpl.make(api, "rooms", "skip", skip),
);

export const rooms = GroupImpl.make(api, "rooms").pipe(Layer.provide(fns));
