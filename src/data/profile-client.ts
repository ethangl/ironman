import { ConvexHttpClient } from "convex/browser";

import { api } from "../../convex/_generated/api";
import type { ProfileData } from "@/lib/profile-data";

export interface ProfileClient {
  getCurrent: (
    args: {
      userId: string;
      name: string;
      image: string | null;
    } | null,
  ) => Promise<ProfileData | null>;
  getPublic: (userId: string) => Promise<ProfileData | null>;
}

let cachedProfileClient: ProfileClient | null = null;
let cachedProfileUrl: string | null = null;

function getConvexProfileUrl() {
  const url =
    typeof window === "undefined"
      ? process.env.CONVEX_URL
      : import.meta.env.CONVEX_URL;

  if (!url) {
    throw new Error("Missing CONVEX_URL for Convex profile access.");
  }

  return url;
}

export function createConvexProfileClient(convexUrl: string): ProfileClient {
  const convex = new ConvexHttpClient(convexUrl);

  return {
    getCurrent: async (args) => {
      if (!args) return null;

      return convex.query(api.profile.get, {
        userId: args.userId,
        fallbackName: args.name,
        fallbackImage: args.image ?? undefined,
      });
    },
    getPublic: (userId) =>
      convex.query(api.profile.get, {
        userId,
      }),
  };
}

function getDefaultConvexProfileClient() {
  const convexUrl = getConvexProfileUrl();

  if (!cachedProfileClient || cachedProfileUrl !== convexUrl) {
    cachedProfileClient = createConvexProfileClient(convexUrl);
    cachedProfileUrl = convexUrl;
  }

  return cachedProfileClient;
}

export const convexProfileClient: ProfileClient = {
  getCurrent: (args) => getDefaultConvexProfileClient().getCurrent(args),
  getPublic: (userId) => getDefaultConvexProfileClient().getPublic(userId),
};
