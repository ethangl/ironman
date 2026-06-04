import { FunctionImpl, GroupImpl } from "@confect/server";
import { Layer } from "effect";

import api from "./_generated/api";
import { upsert } from "./users";

export const users = GroupImpl.make(api, "users").pipe(
  Layer.provide(FunctionImpl.make(api, "users", "upsert", upsert)),
);
