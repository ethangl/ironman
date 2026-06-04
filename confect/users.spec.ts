import { FunctionSpec, GroupSpec } from "@confect/core";

import type { upsert } from "./users";

export const users = GroupSpec.make("users").addFunction(
  FunctionSpec.convexPublicMutation<typeof upsert>()("upsert"),
);
