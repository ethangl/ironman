import { FunctionImpl, GroupImpl } from "@confect/server";
import { Layer } from "effect";

import api from "./_generated/api";
import { disconnect, heartbeat } from "./roomPresence";

export const roomPresence = GroupImpl.make(api, "roomPresence").pipe(
  Layer.provide(FunctionImpl.make(api, "roomPresence", "heartbeat", heartbeat)),
  Layer.provide(
    FunctionImpl.make(api, "roomPresence", "disconnect", disconnect),
  ),
);
