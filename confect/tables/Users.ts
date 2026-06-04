import { Table } from "@confect/server";
import { Schema } from "effect";

export const Users = Table.make(
  "users",
  Schema.Struct({
    userId: Schema.String,
    name: Schema.String,
    image: Schema.optional(Schema.String),
  }),
).index("by_userId", ["userId"]);
