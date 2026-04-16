import { convexAuthClient as authClient } from "./convex-auth-client";

const TOKEN_EXPIRY_SKEW_MS = 30_000;
const FALLBACK_TOKEN_TTL_MS = 60_000;

const cachedSpotifyTokens = new Map<
  string,
  { token: string; expiresAt: number }
>();
const inFlightSpotifyTokenRequests = new Map<string, Promise<string | null>>();

function normalizeExpiry(expiresAt: Date | number | string | null | undefined) {
  if (expiresAt instanceof Date) {
    return expiresAt.getTime();
  }

  if (typeof expiresAt === "string") {
    const parsed = Date.parse(expiresAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
    return Date.now() + FALLBACK_TOKEN_TTL_MS;
  }

  return expiresAt > 1_000_000_000_000 ? expiresAt : expiresAt * 1000;
}

export async function getCachedSpotifyAccessToken(
  userId: string,
): Promise<string | null> {
  const cached = cachedSpotifyTokens.get(userId);
  if (cached && Date.now() < cached.expiresAt - TOKEN_EXPIRY_SKEW_MS) {
    return cached.token;
  }

  if (cached) {
    cachedSpotifyTokens.delete(userId);
  }

  const inFlight = inFlightSpotifyTokenRequests.get(userId);
  if (inFlight) {
    return inFlight;
  }

  const request = authClient
    .getAccessToken({ providerId: "spotify" })
    .then((response) => {
      const token = response.data?.accessToken ?? null;
      if (!token) {
        clearCachedSpotifyAccessToken(userId);
        return null;
      }

      cachedSpotifyTokens.set(userId, {
        token,
        expiresAt: normalizeExpiry(response.data?.accessTokenExpiresAt),
      });
      return token;
    })
    .catch(() => {
      clearCachedSpotifyAccessToken(userId);
      return null;
    })
    .finally(() => {
      if (inFlightSpotifyTokenRequests.get(userId) === request) {
        inFlightSpotifyTokenRequests.delete(userId);
      }
    });

  inFlightSpotifyTokenRequests.set(userId, request);
  return request;
}

export function clearCachedSpotifyAccessToken(userId?: string) {
  if (userId) {
    cachedSpotifyTokens.delete(userId);
    inFlightSpotifyTokenRequests.delete(userId);
    return;
  }

  cachedSpotifyTokens.clear();
  inFlightSpotifyTokenRequests.clear();
}
