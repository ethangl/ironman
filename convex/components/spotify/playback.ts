import { v } from "convex/values";

import { action } from "./_generated/server";
import type {
  PlaybackCurrentlyPlayingResult,
  PlaybackResult,
  PlaybackState,
} from "./types";
import {
  spotifyPlaybackCurrentlyPlayingResultValidator,
  spotifyPlaybackResultValidator,
} from "./validators";

const SPOTIFY_API = "https://api.spotify.com/v1";

function getRetryAfterSeconds(response: Response) {
  const value = Number(response.headers.get("retry-after"));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function normalizePositionMs(positionMs?: number) {
  if (typeof positionMs !== "number" || !Number.isFinite(positionMs)) {
    return undefined;
  }

  return Math.max(0, Math.trunc(positionMs));
}

function normalizePlaybackState(raw: unknown): PlaybackState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const playback = raw as {
    is_playing?: unknown;
    progress_ms?: unknown;
    item?: {
      id?: unknown;
      name?: unknown;
      duration_ms?: unknown;
      artists?: { name?: unknown }[];
    } | null;
  };

  const item = playback.item;

  return {
    is_playing: playback.is_playing === true,
    progress_ms:
      typeof playback.progress_ms === "number" ? playback.progress_ms : 0,
    item:
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.duration_ms === "number"
        ? {
            id: item.id,
            name: item.name,
            duration_ms: item.duration_ms,
            artists: Array.isArray(item.artists)
              ? item.artists
                  .map((artist) =>
                    typeof artist?.name === "string"
                      ? { name: artist.name }
                      : null,
                  )
                  .filter((artist): artist is { name: string } => !!artist)
              : [],
          }
        : null,
  };
}

export async function getCurrentlyPlaying(
  token: string,
): Promise<PlaybackCurrentlyPlayingResult> {
  try {
    const res = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const retryAfterSeconds = getRetryAfterSeconds(res);
    if (!res.ok && res.status !== 204 && res.status !== 202) {
      return {
        status: res.status,
        playback: null,
        ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
      };
    }
    if (res.status === 204 || res.status === 202) {
      return {
        status: res.status,
        playback: null,
      };
    }
    const text = await res.text();
    return {
      status: res.status,
      playback: text ? normalizePlaybackState(JSON.parse(text)) : null,
    };
  } catch {
    return { status: 0, playback: null };
  }
}

export async function playUri(
  uri: string,
  token: string,
  deviceId?: string,
  offsetMs?: number,
): Promise<PlaybackResult> {
  const query = deviceId ? `?device_id=${deviceId}` : "";
  const positionMs = normalizePositionMs(offsetMs);
  const res = await fetch(`${SPOTIFY_API}/me/player/play${query}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: [uri],
      ...(positionMs === undefined ? {} : { position_ms: positionMs }),
    }),
  });
  const retryAfterSeconds = getRetryAfterSeconds(res);
  return {
    ok: res.ok || res.status === 204,
    status: res.status,
    ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
  };
}

export async function resumePlayback(token: string): Promise<PlaybackResult> {
  const res = await fetch(`${SPOTIFY_API}/me/player/play`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  const retryAfterSeconds = getRetryAfterSeconds(res);
  return {
    ok: res.ok || res.status === 204,
    status: res.status,
    ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
  };
}

export async function pausePlayback(token: string): Promise<PlaybackResult> {
  try {
    const res = await fetch(`${SPOTIFY_API}/me/player/pause`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const retryAfterSeconds = getRetryAfterSeconds(res);
    return {
      ok: res.ok || res.status === 204,
      status: res.status,
      ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function setVolumePercent(
  percent: number,
  token: string,
): Promise<PlaybackResult> {
  try {
    const res = await fetch(
      `${SPOTIFY_API}/me/player/volume?volume_percent=${percent}`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
    );
    const retryAfterSeconds = getRetryAfterSeconds(res);
    return {
      ok: res.ok || res.status === 204,
      status: res.status,
      ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function setRepeatMode(
  state: "track" | "context" | "off",
  token: string,
  deviceId?: string,
): Promise<PlaybackResult> {
  const query = deviceId ? `&device_id=${deviceId}` : "";
  try {
    const res = await fetch(
      `${SPOTIFY_API}/me/player/repeat?state=${state}${query}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const retryAfterSeconds = getRetryAfterSeconds(res);
    return {
      ok: res.ok || res.status === 204,
      status: res.status,
      ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

export const currentlyPlaying = action({
  args: {
    accessToken: v.string(),
  },
  returns: spotifyPlaybackCurrentlyPlayingResultValidator,
  handler: async (_ctx, args) => getCurrentlyPlaying(args.accessToken),
});

export const play = action({
  args: {
    accessToken: v.string(),
    uri: v.string(),
    deviceId: v.optional(v.string()),
    offsetMs: v.optional(v.number()),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (_ctx, args) =>
    playUri(args.uri, args.accessToken, args.deviceId, args.offsetMs),
});

export const resume = action({
  args: {
    accessToken: v.string(),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (_ctx, args) => resumePlayback(args.accessToken),
});

export const pause = action({
  args: {
    accessToken: v.string(),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (_ctx, args) => pausePlayback(args.accessToken),
});

export const setRepeat = action({
  args: {
    accessToken: v.string(),
    state: v.union(v.literal("track"), v.literal("context"), v.literal("off")),
    deviceId: v.optional(v.string()),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (_ctx, args) =>
    setRepeatMode(args.state, args.accessToken, args.deviceId),
});

export const setVolume = action({
  args: {
    accessToken: v.string(),
    percent: v.number(),
  },
  returns: spotifyPlaybackResultValidator,
  handler: async (_ctx, args) =>
    setVolumePercent(args.percent, args.accessToken),
});
