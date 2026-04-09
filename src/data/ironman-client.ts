import { ConvexHttpClient } from "convex/browser";

import { convexAuthClient as authClient } from "@/lib/convex-auth-client";
import type { StreakData, TrackInfo } from "@/types";
import { api } from "../../convex/_generated/api";
import {
  type PollIronmanInput,
  type PollIronmanResult,
  type ReportWeaknessResult,
} from "./ironman";

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

function getConvexIronmanUrl() {
  const url =
    typeof window === "undefined"
      ? process.env.CONVEX_URL
      : import.meta.env.CONVEX_URL;

  if (!url) {
    throw new Error("Missing CONVEX_URL for Convex ironman access.");
  }

  return url;
}

function getDefaultConvexIronmanClient() {
  const convexUrl = getConvexIronmanUrl();
  if (!cachedIronmanClient || cachedIronmanUrl !== convexUrl) {
    cachedIronmanClient = new ConvexHttpClient(convexUrl);
    cachedIronmanUrl = convexUrl;
  }

  return cachedIronmanClient;
}

async function getAuthenticatedConvexIronmanClient() {
  const client = getDefaultConvexIronmanClient();
  const response = await authClient.convex.token({
    fetchOptions: { throw: false },
  });
  const token = response.data?.token ?? null;

  if (!token) {
    client.clearAuth();
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
