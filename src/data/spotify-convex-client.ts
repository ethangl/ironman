import { ConvexHttpClient } from "convex/browser";

import {
  clearCachedConvexAuthToken,
  getCachedConvexAuthToken,
} from "@/data/convex-auth-token";
import { getConvexUrl } from "@/lib/convex-env";
import { api } from "@api";

let cachedClient: ConvexHttpClient | null = null;
let cachedUrl: string | null = null;

export function getDefaultSpotifyConvexClient() {
  const convexUrl = getConvexUrl("Convex Spotify access");

  if (!cachedClient || cachedUrl !== convexUrl) {
    cachedClient = new ConvexHttpClient(convexUrl);
    cachedUrl = convexUrl;
  }

  return cachedClient;
}

export async function getAuthenticatedSpotifyConvexClient() {
  const client = getDefaultSpotifyConvexClient();
  const token = await getCachedConvexAuthToken();

  if (!token) {
    client.clearAuth();
    clearCachedConvexAuthToken();
    throw new Error("Unauthorized");
  }

  client.setAuth(token);
  return client;
}

export async function clearSpotifyDevCache() {
  const client = await getAuthenticatedSpotifyConvexClient();
  return client.action(api.spotify.clearCache, {});
}
