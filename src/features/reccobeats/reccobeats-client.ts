import { ConvexHttpClient } from "convex/browser";

import {
  clearCachedConvexAuthToken,
  getCachedConvexAuthToken,
} from "@/lib/convex-auth-token";
import { getConvexUrl } from "@/lib/convex-env";
import { api } from "@api";

export interface ReccobeatsClient {
  ensureTrackAudioFeatures: (trackIds: string[]) => Promise<void>;
}

let cachedClient: ConvexHttpClient | null = null;
let cachedUrl: string | null = null;

function uniqueTrackIds(trackIds: string[]) {
  return [...new Set(trackIds.map((trackId) => trackId.trim()).filter(Boolean))];
}

function getDefaultReccobeatsConvexClient() {
  const convexUrl = getConvexUrl("Convex ReccoBeats access");

  if (!cachedClient || cachedUrl !== convexUrl) {
    cachedClient = new ConvexHttpClient(convexUrl);
    cachedUrl = convexUrl;
  }

  return cachedClient;
}

async function getAuthenticatedReccobeatsConvexClient() {
  const client = getDefaultReccobeatsConvexClient();
  const token = await getCachedConvexAuthToken();

  if (!token) {
    client.clearAuth();
    clearCachedConvexAuthToken();
    throw new Error("Unauthorized");
  }

  client.setAuth(token);
  return client;
}

export function createConvexReccobeatsClient(): ReccobeatsClient {
  return {
    async ensureTrackAudioFeatures(trackIds) {
      const normalizedTrackIds = uniqueTrackIds(trackIds);
      if (normalizedTrackIds.length === 0) {
        return;
      }

      const client = await getAuthenticatedReccobeatsConvexClient();
      await client.action(api.reccobeats.ensureTrackAudioFeatures, {
        trackIds: normalizedTrackIds,
      });
    },
  };
}

export const convexReccobeatsClient = createConvexReccobeatsClient();
