import { FunctionImpl, GroupImpl } from "@confect/server";
import { Layer } from "effect";

import api from "./_generated/api";
import { get } from "./profile";

export const profile = GroupImpl.make(api, "profile").pipe(
  Layer.provide(FunctionImpl.make(api, "profile", "get", get)),
);
