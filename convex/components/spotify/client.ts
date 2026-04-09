import { SpotifyApiError } from "./errors";

const SPOTIFY_API = "https://api.spotify.com/v1";

function logSpotifyRequest(details: {
  path: string;
  method: string;
  status: number;
  durationMs: number;
  retryAfterSeconds?: number | null;
}) {
  if (process.env.NODE_ENV === "test") return;

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

export async function spotifyFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T | null> {
  const startedAt = Date.now();
  const method = options?.method ?? "GET";
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

  if (res.status === 204 || res.status === 202) return null;
  const text = await res.text();
  if (!res.ok) {
    throw new SpotifyApiError(
      res.status,
      `Spotify API error ${res.status}: ${text}`,
      retryAfterSeconds,
    );
  }
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
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
