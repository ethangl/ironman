import { ConvexHttpClient } from "convex/browser";

import type { SongStats } from "@/data/songs";
import { api } from "../../convex/_generated/api";

export interface SongsClient {
  getStats: (trackId: string) => Promise<SongStats | null>;
}

let cachedSongsClient: SongsClient | null = null;
let cachedSongsUrl: string | null = null;

function getConvexSongsUrl() {
  const url =
    typeof window === "undefined"
      ? process.env.CONVEX_URL
      : import.meta.env.CONVEX_URL;

  if (!url) {
    throw new Error("Missing CONVEX_URL for Convex song stats access.");
  }

  return url;
}

export function createConvexSongsClient(convexUrl: string): SongsClient {
  const convex = new ConvexHttpClient(convexUrl);

  return {
    getStats: (trackId) => convex.query(api.songs.get, { trackId }),
  };
}

function getDefaultConvexSongsClient() {
  const convexUrl = getConvexSongsUrl();

  if (!cachedSongsClient || cachedSongsUrl !== convexUrl) {
    cachedSongsClient = createConvexSongsClient(convexUrl);
    cachedSongsUrl = convexUrl;
  }

  return cachedSongsClient;
}

export const convexSongsClient: SongsClient = {
  getStats: (trackId) => getDefaultConvexSongsClient().getStats(trackId),
};
