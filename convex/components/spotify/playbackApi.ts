import { PlaybackState } from "./types";

const SPOTIFY_API = "https://api.spotify.com/v1";

export async function getCurrentlyPlaying(
  token: string,
): Promise<{ status: number; playback: PlaybackState | null }> {
  try {
    const res = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204 && res.status !== 202) {
      return { status: res.status, playback: null };
    }
    if (res.status === 204 || res.status === 202) {
      return { status: res.status, playback: null };
    }
    const text = await res.text();
    return {
      status: res.status,
      playback: text ? (JSON.parse(text) as PlaybackState) : null,
    };
  } catch {
    return { status: 0, playback: null };
  }
}

export async function playUri(uri: string, token: string, deviceId?: string) {
  const query = deviceId ? `?device_id=${deviceId}` : "";
  const res = await fetch(`${SPOTIFY_API}/me/player/play${query}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [uri] }),
  });
  return { ok: res.ok || res.status === 204, status: res.status };
}

export async function resumePlayback(token: string) {
  const res = await fetch(`${SPOTIFY_API}/me/player/play`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ok: res.ok || res.status === 204, status: res.status };
}

export async function pausePlayback(token: string) {
  try {
    const res = await fetch(`${SPOTIFY_API}/me/player/pause`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: res.ok || res.status === 204, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function setVolumePercent(percent: number, token: string) {
  try {
    const res = await fetch(
      `${SPOTIFY_API}/me/player/volume?volume_percent=${percent}`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
    );
    return { ok: res.ok || res.status === 204, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function setRepeatMode(
  state: "track" | "context" | "off",
  token: string,
  deviceId?: string,
) {
  const query = deviceId ? `&device_id=${deviceId}` : "";
  try {
    const res = await fetch(
      `${SPOTIFY_API}/me/player/repeat?state=${state}${query}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return { ok: res.ok || res.status === 204, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
