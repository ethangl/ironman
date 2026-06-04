import { FunctionSpec, GroupSpec } from "@confect/core";

import type { artistDetails } from "./lastfm";

/** Plain Convex action wrapping the relocated lastfm component. */
export const lastfm = GroupSpec.make("lastfm").addFunction(
  FunctionSpec.convexPublicAction<typeof artistDetails>()("artistDetails"),
);
