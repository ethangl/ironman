import { FunctionSpec, GroupSpec } from "@confect/core";

import type { disconnect, heartbeat } from "./roomPresence";

/**
 * Presence group, ported from `convex/roomPresence.ts`. Plain Convex mutations
 * (they drive the `@convex-dev/presence` component, which needs a raw ctx) and
 * share `getVisibleRoomContext`/`insertRoomPresenceActivity` with `rooms`.
 */
export const roomPresence = GroupSpec.make("roomPresence")
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof heartbeat>()("heartbeat"),
  )
  .addFunction(
    FunctionSpec.convexPublicMutation<typeof disconnect>()("disconnect"),
  );
