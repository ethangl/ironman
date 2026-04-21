import { SpotifyApiError } from "./errors";

const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_RATE_LIMIT_FALLBACK_MS = 5_000;
const spotifyRequestCooldowns = new Map<string, number>();
const spotifyGetRequestsInFlight = new Map<string, Promise<unknown>>();

function logSpotifyRequest(details: {
  path: string;
  method: string;
  status: number;
  durationMs: number;
  retryAfterSeconds?: number | null;
}) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const parts = [
    `[spotify] ${details.method} ${details.path}`,
    `status=${details.status}`,
    `duration=${details.durationMs}ms`,
  ];
  if (details.retryAfterSeconds) {
    parts.push(`retry_after=${details.retryAfterSeconds}s`);
  }
  console.info(parts.join(" "));
}

function getRequestCooldownKey(method: string, path: string, token: string) {
  return `${method}:${path}:${token}`;
}

function setRequestCooldown(
  key: string,
  retryAfterSeconds?: number | null,
) {
  const durationMs =
    typeof retryAfterSeconds === "number" && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : SPOTIFY_RATE_LIMIT_FALLBACK_MS;
  spotifyRequestCooldowns.set(key, Date.now() + durationMs);
}

function getCooldownRetryAfterSeconds(key: string) {
  const nextAllowedAt = spotifyRequestCooldowns.get(key);
  if (!nextAllowedAt) {
    return null;
  }

  if (Date.now() >= nextAllowedAt) {
    spotifyRequestCooldowns.delete(key);
    return null;
  }

  return Math.max(1, Math.ceil((nextAllowedAt - Date.now()) / 1000));
}

export function clearSpotifyFetchState() {
  spotifyRequestCooldowns.clear();
  spotifyGetRequestsInFlight.clear();
}

function runDedupedGetRequest<T>(
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  const existing = spotifyGetRequestsInFlight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const request = load().finally(() => {
    if (spotifyGetRequestsInFlight.get(key) === request) {
      spotifyGetRequestsInFlight.delete(key);
    }
  });
  spotifyGetRequestsInFlight.set(key, request);
  return request;
}

export async function spotifyFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T | null> {
  const method = options?.method ?? "GET";
  const cooldownKey = getRequestCooldownKey(method, path, token);
  const cooldownRetryAfterSeconds = getCooldownRetryAfterSeconds(cooldownKey);
  if (cooldownRetryAfterSeconds !== null) {
    throw new SpotifyApiError(
      429,
      `Spotify API error 429: cooldown active for ${method} ${path}`,
      cooldownRetryAfterSeconds,
    );
  }

  const execute = async () => {
    const startedAt = Date.now();
    const res = await fetch(`${SPOTIFY_API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const retryAfterSeconds = Number(res.headers.get("retry-after")) || null;
    logSpotifyRequest({
      path,
      method,
      status: res.status,
      durationMs: Date.now() - startedAt,
      retryAfterSeconds,
    });

    if (res.status === 204 || res.status === 202) {
      return null;
    }
    const text = await res.text();
    if (!res.ok) {
      if (res.status === 429) {
        setRequestCooldown(cooldownKey, retryAfterSeconds);
      }
      throw new SpotifyApiError(
        res.status,
        `Spotify API error ${res.status}: ${text}`,
        retryAfterSeconds,
      );
    }
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  };

  if (method === "GET") {
    return runDedupedGetRequest(cooldownKey, execute);
  }

  return execute();
}

export async function spotifyFetchOptional<T>(
  path: string,
  token: string,
  fallback: T,
): Promise<T> {
  try {
    return (await spotifyFetch<T>(path, token)) ?? fallback;
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[spotify] optional request failed path=${path} error=${error instanceof Error ? error.message : "unknown"}`,
      );
    }
    return fallback;
  }
}
