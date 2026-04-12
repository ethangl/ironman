import { convexAuthClient as authClient } from "@/lib/convex-auth-client";

const TOKEN_EXPIRY_SKEW_MS = 30_000;
const FALLBACK_TOKEN_TTL_MS = 60_000;

let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0;
let inFlightTokenRequest: Promise<string | null> | null = null;

export async function getCachedConvexAuthToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - TOKEN_EXPIRY_SKEW_MS) {
    return cachedToken;
  }

  if (inFlightTokenRequest) {
    return inFlightTokenRequest;
  }

  inFlightTokenRequest = authClient.convex
    .token({
      fetchOptions: { throw: false },
    })
    .then((response) => {
      const token = response.data?.token ?? null;

      if (!token) {
        clearCachedConvexAuthToken();
        return null;
      }

      cachedToken = token;
      cachedTokenExpiresAt =
        decodeJwtExpiry(token) ?? Date.now() + FALLBACK_TOKEN_TTL_MS;
      return token;
    })
    .catch(() => {
      clearCachedConvexAuthToken();
      return null;
    })
    .finally(() => {
      inFlightTokenRequest = null;
    });

  return inFlightTokenRequest;
}

export function clearCachedConvexAuthToken() {
  cachedToken = null;
  cachedTokenExpiresAt = 0;
  inFlightTokenRequest = null;
}

function decodeJwtExpiry(token: string): number | null {
  const [, payload] = token.split(".");
  if (!payload || typeof atob !== "function") return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}
