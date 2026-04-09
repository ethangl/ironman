import { ConvexHttpClient } from "convex/browser";

import { convexAuthClient as authClient } from "@/lib/convex-auth-client";

let cachedClient: ConvexHttpClient | null = null;
let cachedUrl: string | null = null;

export function getSpotifyConvexUrl() {
  const url =
    typeof window === "undefined"
      ? process.env.CONVEX_URL
      : import.meta.env.CONVEX_URL;

  if (!url) {
    throw new Error("Missing CONVEX_URL for Convex Spotify access.");
  }

  return url;
}

export function getDefaultSpotifyConvexClient() {
  const convexUrl = getSpotifyConvexUrl();

  if (!cachedClient || cachedUrl !== convexUrl) {
    cachedClient = new ConvexHttpClient(convexUrl);
    cachedUrl = convexUrl;
  }

  return cachedClient;
}

export async function getAuthenticatedSpotifyConvexClient() {
  const client = getDefaultSpotifyConvexClient();
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
