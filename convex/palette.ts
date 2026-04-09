"use node";

import { v } from "convex/values";

import { extractPalette } from "../src/lib/palette";
import { action } from "./_generated/server";

export const extract = action({
  args: {
    imageUrl: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (_ctx, args) => extractPalette(args.imageUrl),
});
