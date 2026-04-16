import { spotifyFetch } from "./client";
import {
  isSpotifyTrack,
  mapArtist,
  mapPlaylist,
  mapTrack,
  type SpotifyApiArtist,
  type SpotifyApiTrack,
  type SpotifyApiPlaylist,
} from "./mappers";

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
    images?: { url: string }[];
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

interface FollowedArtistsResponse {
  artists?: {
    items?: SpotifyApiArtist[];
  };
}

export async function getRecentlyPlayed(token: string, limit = 30) {
  const data = await spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}`,
    token,
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
    token,
  );
  if (!data?.items) return { items: [], total: 0 };

  const items = data.items.map((playlist) => ({
    ...mapPlaylist(playlist as SpotifyApiPlaylist),
    trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
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
    token,
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

export async function getFavoriteArtists(token: string, limit = 50) {
  const data = await spotifyFetch<FollowedArtistsResponse>(
    `/me/following?type=artist&limit=${limit}`,
    token,
  );
  const artists = (data?.artists?.items ?? []).map(mapArtist);

  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[spotify] followed artists limit=${limit} items=${artists.length}`,
    );
  }

  return artists;
}
