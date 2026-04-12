import { ConvexHttpClient } from "convex/browser";

import { api } from "@api";
import { getConvexUrl } from "@/lib/convex-env";
import type { SongStats } from "@shared/song-stats";

export interface SongsClient {
  getStats: (trackId: string) => Promise<SongStats | null>;
}

let cachedSongsClient: SongsClient | null = null;
let cachedSongsUrl: string | null = null;

export function createConvexSongsClient(convexUrl: string): SongsClient {
  const convex = new ConvexHttpClient(convexUrl);

  return {
    getStats: (trackId) => convex.query(api.songs.get, { trackId }),
  };
}

function getDefaultConvexSongsClient() {
  const convexUrl = getConvexUrl("Convex song stats access");

  if (!cachedSongsClient || cachedSongsUrl !== convexUrl) {
    cachedSongsClient = createConvexSongsClient(convexUrl);
    cachedSongsUrl = convexUrl;
  }

  return cachedSongsClient;
}

export const convexSongsClient: SongsClient = {
  getStats: (trackId) => getDefaultConvexSongsClient().getStats(trackId),
};
