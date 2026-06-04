import { FunctionSpec, GroupSpec } from "@confect/core";

import type { get } from "./profile";

export const profile = GroupSpec.make("profile").addFunction(
  FunctionSpec.convexPublicQuery<typeof get>()("get"),
);
