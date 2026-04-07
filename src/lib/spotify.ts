import { SpotifyTrack, PlaybackState } from "@/types";

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

export class SpotifyApiError extends Error {
  status: number;
  retryAfterSeconds: number | null;

  constructor(status: number, message: string, retryAfterSeconds?: number | null) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds ?? null;
  }
}

interface SpotifyImage {
  url: string;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbum {
  name?: string;
  images?: SpotifyImage[];
}

interface SpotifyApiTrack {
  id: string;
  name: string;
  artists?: SpotifyArtist[];
  album?: SpotifyAlbum;
  duration_ms: number;
}

interface SearchTracksResponse {
  tracks?: {
    items?: SpotifyApiTrack[];
  };
}

interface RecentlyPlayedResponse {
  items?: {
    played_at: string;
    track: SpotifyApiTrack;
  }[];
}

interface PlaylistSummaryResponse {
  items?: {
    id: string;
    name: string;
    description: string | null;
    images?: SpotifyImage[];
    tracks?: { total?: number };
    owner?: { display_name?: string | null };
    public: boolean;
  }[];
  total: number;
}

interface PlaylistTracksResponse {
  items?: {
    track?: SpotifyApiTrack | null;
    item?: SpotifyApiTrack | null;
  }[];
}

function isSpotifyTrack(
  track: SpotifyApiTrack | null | undefined,
): track is SpotifyApiTrack {
  return !!track;
}

async function spotifyFetch<T>(
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
    // Some endpoints return non-JSON success responses
    return null;
  }
}

export async function searchTracks(
  query: string,
  token: string
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SearchTracksResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    token
  );

  return (data?.tracks?.items ?? []).map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists?.map((artist) => artist.name).join(", ") ?? "",
    albumName: track.album?.name ?? "",
    albumImage: track.album?.images?.[0]?.url ?? null,
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

export async function getRecentlyPlayed(token: string, limit = 20) {
  const data = await spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}`,
    token
  );
  if (!data?.items) return [];
  return data.items.map((item) => ({
    playedAt: item.played_at,
    track: {
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists?.map((artist) => artist.name).join(", ") ?? "",
      albumName: item.track.album?.name ?? "",
      albumImage: item.track.album?.images?.[0]?.url ?? null,
      durationMs: item.track.duration_ms,
    },
  }));
}

export async function getUserPlaylists(token: string, limit = 50, offset = 0) {
  const data = await spotifyFetch<PlaylistSummaryResponse>(
    `/me/playlists?limit=${limit}&offset=${offset}`,
    token
  );
  if (!data?.items) return { items: [], total: 0 };

  const items = data.items.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    image: playlist.images?.[0]?.url ?? null,
    trackCount: playlist.tracks?.total ?? 0,
    tracks: null,
    owner: playlist.owner?.display_name ?? null,
    public: playlist.public,
  }));

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] playlists summary limit=${limit} offset=${offset} items=${items.length} total=${data.total}`,
    );
  }

  return { items, total: data.total };
}

export async function getPlaylistTracks(token: string, playlistId: string) {
  const data = await spotifyFetch<PlaylistTracksResponse>(
    `/playlists/${playlistId}/tracks?limit=100`,
    token
  );
  if (!data?.items) return [];

  const tracks = data.items
    .map((entry) => entry.track ?? entry.item)
    .filter(isSpotifyTrack)
    .map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.map((artist) => artist.name).join(", ") ?? "",
      albumName: track.album?.name ?? "",
      albumImage: track.album?.images?.[0]?.url ?? null,
      durationMs: track.duration_ms,
    }));

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] playlist tracks playlist_id=${playlistId} items=${tracks.length}`,
    );
  }

  return tracks;
}
