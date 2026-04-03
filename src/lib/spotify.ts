import { SpotifyTrack, PlaybackState } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

async function spotifyFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${SPOTIFY_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (res.status === 204 || res.status === 202) return null;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Spotify API error ${res.status}: ${text}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Some endpoints return non-JSON success responses
    return null;
  }
}

export async function searchTracks(
  query: string,
  token: string
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    token
  );

  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((a: any) => a.name).join(", "),
    albumName: track.album.name,
    albumImage: track.album.images[0]?.url ?? null,
    durationMs: track.duration_ms,
  }));
}

export async function getCurrentlyPlaying(
  token: string
): Promise<PlaybackState | null> {
  try {
    return await spotifyFetch("/me/player/currently-playing", token);
  } catch {
    return null;
  }
}

export async function playTrack(trackId: string, token: string, deviceId?: string) {
  const query = deviceId ? `?device_id=${deviceId}` : "";
  await spotifyFetch(`/me/player/play${query}`, token, {
    method: "PUT",
    body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
  });
}

export async function setRepeatMode(
  state: "track" | "context" | "off",
  token: string,
  deviceId?: string,
) {
  const query = deviceId ? `&device_id=${deviceId}` : "";
  await spotifyFetch(`/me/player/repeat?state=${state}${query}`, token, {
    method: "PUT",
  });
}

export async function getProfile(token: string) {
  return spotifyFetch("/me", token);
}
