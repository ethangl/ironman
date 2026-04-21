import { convexAuthClient as authClient } from "../../lib/convex-auth-client";

type LinkedAccount = { providerId: string };

function unwrapAccountsResponse(payload: unknown): LinkedAccount[] {
  if (Array.isArray(payload)) {
    return payload as LinkedAccount[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data as LinkedAccount[];
  }

  return [];
}

const cachedSpotifyAccountLinks = new Map<string, boolean>();
const inFlightSpotifyAccountLinkRequests = new Map<string, Promise<boolean>>();

export async function hasCachedSpotifyAccountLink(
  userId: string,
): Promise<boolean> {
  const cached = cachedSpotifyAccountLinks.get(userId);
  if (typeof cached === "boolean") {
    return cached;
  }

  const inFlight = inFlightSpotifyAccountLinkRequests.get(userId);
  if (inFlight) {
    return inFlight;
  }

  const request = authClient
    .$fetch("/list-accounts", {
      method: "GET",
    })
    .then((accounts) => {
      const linked = unwrapAccountsResponse(accounts).some(
        (account) => account.providerId === "spotify",
      );
      cachedSpotifyAccountLinks.set(userId, linked);
      return linked;
    })
    .catch(() => {
      clearCachedSpotifyAccountLink(userId);
      return false;
    })
    .finally(() => {
      if (inFlightSpotifyAccountLinkRequests.get(userId) === request) {
        inFlightSpotifyAccountLinkRequests.delete(userId);
      }
    });

  inFlightSpotifyAccountLinkRequests.set(userId, request);
  return request;
}

export function clearCachedSpotifyAccountLink(userId?: string) {
  if (userId) {
    cachedSpotifyAccountLinks.delete(userId);
    inFlightSpotifyAccountLinkRequests.delete(userId);
    return;
  }

  cachedSpotifyAccountLinks.clear();
  inFlightSpotifyAccountLinkRequests.clear();
}
