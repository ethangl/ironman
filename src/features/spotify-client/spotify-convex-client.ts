import { ConvexHttpClient } from "convex/browser";

import {
  clearCachedConvexAuthToken,
  getCachedConvexAuthToken,
} from "@/lib/convex-auth-token";
import { getConvexUrl } from "@/lib/convex-env";
import { api } from "@api";

import {
  clearSpotifyAuthFailure,
  reportSpotifyAuthFailure,
} from "./spotify-auth-status";
import { isSpotifyAuthRequired } from "./spotify-error";

let cachedClient: ConvexHttpClient | null = null;
let cachedUrl: string | null = null;

// Wrap `action` so every authenticated spotify call funnels its outcome into
// the app-wide auth-status signal: a `SpotifyAuthRequired` failure flips the
// reconnect gate on; any success clears it. All feature clients call `.action`
// on this shared client, so this is the single chokepoint.
function trackSpotifyAuth(client: ConvexHttpClient): ConvexHttpClient {
  const action = client.action.bind(client) as ConvexHttpClient["action"];
  client.action = ((reference, args) =>
    action(reference, args).then(
      (result) => {
        clearSpotifyAuthFailure();
        return result;
      },
      (error: unknown) => {
        if (isSpotifyAuthRequired(error)) {
          reportSpotifyAuthFailure();
        }
        throw error;
      },
    )) as ConvexHttpClient["action"];
  return client;
}

export function getDefaultSpotifyConvexClient() {
  const convexUrl = getConvexUrl("Convex Spotify access");

  if (!cachedClient || cachedUrl !== convexUrl) {
    cachedClient = trackSpotifyAuth(new ConvexHttpClient(convexUrl));
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
