import {
  SpotifyArtist,
  SpotifyAlbumRelease,
  SpotifyArtistPageData,
  SpotifyPlaylist,
  SpotifySearchResults,
  SpotifyTrack,
  PlaybackState,
} from "@/types";

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

interface SpotifyApiArtist {
  id?: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  followers?: { total?: number };
}

interface SpotifyAlbum {
  id?: string;
  name?: string;
  album_type?: string;
  images?: SpotifyImage[];
  release_date?: string;
  total_tracks?: number;
  artists?: SpotifyApiArtist[];
}

interface SpotifyApiTrack {
  id: string;
  name: string;
  artists?: SpotifyApiArtist[];
  album?: SpotifyAlbum;
  duration_ms: number;
}

interface SpotifyApiPlaylist {
  id: string;
  name: string;
  description: string | null;
  images?: SpotifyImage[];
  owner?: { display_name?: string | null };
  public?: boolean;
  items?: { total?: number };
  tracks?: { total?: number };
}

interface SearchResponse {
  albums?: {
    items?: Array<SpotifyAlbum | null>;
  };
  tracks?: {
    items?: Array<SpotifyApiTrack | null>;
  };
  artists?: {
    items?: Array<SpotifyApiArtist | null>;
  };
  playlists?: {
    items?: Array<SpotifyApiPlaylist | null>;
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
    items?: { total?: number };
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

interface TopArtistsResponse {
  items?: SpotifyApiArtist[];
}

type ArtistResponse = SpotifyApiArtist;

interface SpotifyProfileResponse {
  country?: string;
}

interface ArtistAlbumsResponse {
  items?: Array<SpotifyAlbum | null>;
}

function mapTrack(track: SpotifyApiTrack): SpotifyTrack {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists?.map((artist) => artist.name).join(", ") ?? "",
    albumName: track.album?.name ?? "",
    albumImage: track.album?.images?.[0]?.url ?? null,
    durationMs: track.duration_ms,
  };
}

function mapArtist(artist: SpotifyApiArtist): SpotifyArtist {
  return {
    id: artist.id ?? artist.name,
    name: artist.name,
    image: artist.images?.[0]?.url ?? null,
    followerCount: artist.followers?.total ?? 0,
    genres: artist.genres ?? [],
  };
}

function mapPlaylist(playlist: SpotifyApiPlaylist): SpotifyPlaylist {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    image: playlist.images?.[0]?.url ?? null,
    owner: playlist.owner?.display_name ?? null,
    public: playlist.public ?? true,
    trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
  };
}

function mapAlbumRelease(album: SpotifyAlbum): SpotifyAlbumRelease {
  return {
    id: album.id ?? album.name ?? "",
    name: album.name ?? "Untitled release",
    image: album.images?.[0]?.url ?? null,
    releaseDate: album.release_date ?? null,
    totalTracks: album.total_tracks ?? 0,
    albumType: album.album_type ?? null,
  };
}

function isSpotifyTrack(
  track: SpotifyApiTrack | null | undefined,
): track is SpotifyApiTrack {
  return !!track;
}

function isSpotifyArtist(
  artist: SpotifyApiArtist | null | undefined,
): artist is SpotifyApiArtist {
  return !!artist;
}

function isSpotifyPlaylist(
  playlist: SpotifyApiPlaylist | null | undefined,
): playlist is SpotifyApiPlaylist {
  return !!playlist;
}

function isSpotifyAlbum(
  album: SpotifyAlbum | null | undefined,
): album is SpotifyAlbum {
  return !!album;
}

async function spotifyFetchOptional<T>(
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

async function searchArtistTracks(
  token: string,
  artistId: string,
  artistName: string,
  market?: string,
): Promise<SpotifyTrack[]> {
  const query = `artist:"${artistName}"`;
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "10",
    ...(market ? { market } : {}),
  });

  const data = await spotifyFetchOptional<SearchResponse>(
    `/search?${params.toString()}`,
    token,
    { tracks: { items: [] } },
  );

  const seen = new Set<string>();

  return (data.tracks?.items ?? [])
    .filter(isSpotifyTrack)
    .filter((track) =>
      track.artists?.some((artist) => artist.id === artistId),
    )
    .filter((track) => {
      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    })
    .map(mapTrack);
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
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    token
  );

  return (data?.tracks?.items ?? []).filter(isSpotifyTrack).map(mapTrack);
}

export async function searchSpotify(
  query: string,
  token: string,
): Promise<SpotifySearchResults> {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track,artist,playlist&limit=6`,
    token,
  );

  return {
    tracks: (data?.tracks?.items ?? []).filter(isSpotifyTrack).map(mapTrack),
    artists: (data?.artists?.items ?? []).filter(isSpotifyArtist).map(mapArtist),
    playlists: (data?.playlists?.items ?? [])
      .filter(isSpotifyPlaylist)
      .map(mapPlaylist),
  };
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

export async function getRecentlyPlayed(token: string, limit = 50) {
  const data = await spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}`,
    token
  );
  if (!data?.items) return [];
  return data.items.map((item) => ({
    playedAt: item.played_at,
    track: mapTrack(item.track),
  }));
}

export async function getUserPlaylists(token: string, limit = 50, offset = 0) {
  const data = await spotifyFetch<PlaylistSummaryResponse>(
    `/me/playlists?limit=${limit}&offset=${offset}`,
    token
  );
  if (!data?.items) return { items: [], total: 0 };

  const items = data.items.map((playlist) => ({
    ...mapPlaylist(playlist),
    trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
    tracks: null,
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
    `/playlists/${playlistId}/items?limit=100`,
    token
  );
  if (!data?.items) return [];

  const tracks = data.items
    .map((entry) => entry.track ?? entry.item)
    .filter(isSpotifyTrack)
    .map(mapTrack);

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] playlist tracks playlist_id=${playlistId} items=${tracks.length}`,
    );
  }

  return tracks;
}

export async function getTopArtists(token: string, limit = 20) {
  const data = await spotifyFetch<TopArtistsResponse>(
    `/me/top/artists?limit=${limit}`,
    token,
  );
  const artists = (data?.items ?? []).map(mapArtist);

  if (process.env.NODE_ENV !== "test") {
    console.info(`[spotify] top artists limit=${limit} items=${artists.length}`);
  }

  return artists;
}

export async function getArtistPageData(
  token: string,
  artistId: string,
): Promise<SpotifyArtistPageData> {
  const [artistData, profileData] = await Promise.all([
    spotifyFetch<ArtistResponse>(`/artists/${artistId}`, token),
    spotifyFetch<SpotifyProfileResponse>("/me", token),
  ]);
  const market = profileData?.country;
  const albumsQuery = new URLSearchParams({
    include_groups: "album,single",
    limit: "10",
    ...(market ? { market } : {}),
  }).toString();
  if (!artistData) {
    throw new SpotifyApiError(404, `Artist ${artistId} not found`);
  }
  const [topTracksData, albumsData] = await Promise.all([
    searchArtistTracks(
      token,
      artistId,
      artistData.name,
      market,
    ),
    spotifyFetchOptional<ArtistAlbumsResponse>(
      `/artists/${artistId}/albums?${albumsQuery}`,
      token,
      { items: [] },
    ),
  ]);

  return {
    artist: mapArtist(artistData),
    topTracks: topTracksData,
    releases: (albumsData?.items ?? [])
      .filter(isSpotifyAlbum)
      .map(mapAlbumRelease)
      .filter((album) => album.id !== ""),
  };
}
