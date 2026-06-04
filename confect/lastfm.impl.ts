import { FunctionImpl, GroupImpl } from "@confect/server";
import { Layer } from "effect";

import api from "./_generated/api";
import { artistDetails } from "./lastfm";

export const lastfm = GroupImpl.make(api, "lastfm").pipe(
  Layer.provide(FunctionImpl.make(api, "lastfm", "artistDetails", artistDetails)),
);
