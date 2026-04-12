import { ConvexHttpClient } from "convex/browser";

import {
  clearCachedConvexAuthToken,
  getCachedConvexAuthToken,
} from "@/lib/convex-auth-token";
import { getConvexUrl } from "@/lib/convex-env";
import type { StreakData, TrackInfo } from "@/types";
import { api } from "@api";

interface PollIronmanInput {
  progressMs: number;
  trackId: string;
  isPlaying: boolean;
}

interface PollIronmanResult {
  count: number;
}

interface ReportWeaknessResult {
  broken: boolean;
}

export interface IronmanClient {
  getStatus: () => Promise<StreakData | null>;
  start: (
    track: TrackInfo & { playbackStarted: boolean },
  ) => Promise<StreakData>;
  activateHardcore: () => Promise<unknown>;
  surrender: () => Promise<unknown>;
  reportWeakness: (
    type: string,
    detail?: string,
  ) => Promise<ReportWeaknessResult | null>;
  poll: (input: PollIronmanInput) => Promise<PollIronmanResult>;
}

let cachedIronmanClient: ConvexHttpClient | null = null;
let cachedIronmanUrl: string | null = null;

function getDefaultConvexIronmanClient() {
  const convexUrl = getConvexUrl("Convex ironman access");
  if (!cachedIronmanClient || cachedIronmanUrl !== convexUrl) {
    cachedIronmanClient = new ConvexHttpClient(convexUrl);
    cachedIronmanUrl = convexUrl;
  }

  return cachedIronmanClient;
}

async function getAuthenticatedConvexIronmanClient() {
  const client = getDefaultConvexIronmanClient();
  const token = await getCachedConvexAuthToken();

  if (!token) {
    client.clearAuth();
    clearCachedConvexAuthToken();
    throw new Error("Unauthorized");
  }

  client.setAuth(token);
  return client;
}

export function createConvexIronmanClient(): IronmanClient {
  return {
    async getStatus() {
      try {
        const client = await getAuthenticatedConvexIronmanClient();
        return client.query(api.ironman.status, {});
      } catch {
        return null;
      }
    },
    async start(track) {
      const client = await getAuthenticatedConvexIronmanClient();
      return client.mutation(api.ironman.start, {
        trackId: track.trackId,
        trackName: track.trackName,
        trackArtist: track.trackArtist,
        trackImage: track.trackImage ?? undefined,
        trackDuration: track.trackDuration,
      });
    },
    async activateHardcore() {
      const client = await getAuthenticatedConvexIronmanClient();
      return client.mutation(api.ironman.activateHardcore, {});
    },
    async surrender() {
      const client = await getAuthenticatedConvexIronmanClient();
      return client.mutation(api.ironman.surrender, {});
    },
    async reportWeakness(type, detail) {
      const client = await getAuthenticatedConvexIronmanClient();
      return client.mutation(api.ironman.reportWeakness, {
        type,
        detail: detail ?? undefined,
      });
    },
    async poll(input) {
      const client = await getAuthenticatedConvexIronmanClient();
      return client.mutation(api.ironman.poll, {
        progressMs: input.progressMs,
        trackId: input.trackId,
        isPlaying: input.isPlaying,
      });
    },
  };
}

export const convexIronmanClient = createConvexIronmanClient();
