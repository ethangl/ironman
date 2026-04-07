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

export async function getRecentlyPlayed(token: string, limit = 20) {
  const data = await spotifyFetch(
    `/me/player/recently-played?limit=${limit}`,
    token
  );
  if (!data?.items) return [];
  return data.items.map((item: any) => ({
    playedAt: item.played_at,
    track: {
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join(", "),
      albumName: item.track.album.name,
      albumImage: item.track.album.images[0]?.url ?? null,
      durationMs: item.track.duration_ms,
    },
  }));
}

export async function getUserPlaylists(token: string, limit = 50, offset = 0) {
  const data = await spotifyFetch(
    `/me/playlists?limit=${limit}&offset=${offset}`,
    token
  );
  if (!data?.items) return { items: [], total: 0 };

  const items = await Promise.all(
    data.items.map(async (p: any) => {
      // Fetch actual tracks for each playlist
      let tracks: any[] = [];
      let trackCount = p.tracks?.total ?? 0;
      try {
        const detail = await spotifyFetch(`/playlists/${p.id}`, token);
        const paging = detail?.tracks ?? detail?.items ?? {};
        const trackItems: any[] = paging.items ?? [];
        trackCount = paging.total ?? trackItems.length;
        tracks = trackItems
          .map((entry: any) => entry.track ?? entry.item)
          .filter(Boolean)
          .map((t: any) => ({
            id: t.id,
            name: t.name,
            artist: t.artists?.map((a: any) => a.name).join(", ") ?? "",
            albumName: t.album?.name,
            albumImage: t.album?.images?.[0]?.url ?? null,
            durationMs: t.duration_ms,
          }));
      } catch (e) {
        console.error(`[spotify] Failed to fetch playlist ${p.id}:`, e);
      }
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.images?.[0]?.url ?? null,
        trackCount,
        tracks,
        owner: p.owner?.display_name ?? null,
        public: p.public,
      };
    })
  );

  return { items, total: data.total };
}
