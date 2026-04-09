import { ConvexHttpClient } from "convex/browser";

import { api } from "../../convex/_generated/api";

export interface PaletteClient {
  get: (url: string) => Promise<string[]>;
}

let cachedPaletteClient: PaletteClient | null = null;
let cachedPaletteUrl: string | null = null;

function getConvexPaletteUrl() {
  const url =
    typeof window === "undefined"
      ? process.env.CONVEX_URL
      : import.meta.env.CONVEX_URL;

  if (!url) {
    throw new Error("Missing CONVEX_URL for Convex palette access.");
  }

  return url;
}

export function createConvexPaletteClient(convexUrl: string): PaletteClient {
  const convex = new ConvexHttpClient(convexUrl);

  return {
    get: (imageUrl) => convex.action(api.palette.extract, { imageUrl }),
  };
}

function getDefaultConvexPaletteClient() {
  const convexUrl = getConvexPaletteUrl();

  if (!cachedPaletteClient || cachedPaletteUrl !== convexUrl) {
    cachedPaletteClient = createConvexPaletteClient(convexUrl);
    cachedPaletteUrl = convexUrl;
  }

  return cachedPaletteClient;
}

export const convexPaletteClient: PaletteClient = {
  get: (url) => getDefaultConvexPaletteClient().get(url),
};
