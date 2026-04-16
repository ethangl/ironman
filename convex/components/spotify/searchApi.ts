import { spotifyFetch } from "./client";
import { SpotifyApiError } from "./errors";
import {
  isSpotifyAlbum,
  isSpotifyArtist,
  isSpotifyPlaylist,
  isSpotifyTrack,
  mapAlbumRelease,
  mapArtist,
  mapPlaylist,
  mapTrack,
  type SpotifyAlbum,
  type SpotifyApiArtist,
  type SpotifyApiPlaylist,
  type SpotifyApiTrack,
} from "./mappers";
import type { SpotifyArtistPageData, SpotifySearchResults, SpotifyTrack } from "./types";

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

type ArtistResponse = SpotifyApiArtist;

interface ArtistAlbumsResponse {
  items?: Array<SpotifyAlbum | null>;
}

interface AlbumDetailsResponse extends SpotifyAlbum {
  tracks?: {
    items?: Array<(Omit<SpotifyApiTrack, "album"> & { album?: SpotifyAlbum }) | null>;
  };
}

async function searchArtistTracks(
  token: string,
  artistId: string,
  artistName: string,
  market?: string | null,
): Promise<SpotifyTrack[]> {
  const query = `artist:${artistName}`;
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "10",
    ...(market ? { market } : {}),
  });

  const data = await spotifyFetch<SearchResponse>(
    `/search?${params.toString()}`,
    token,
  );

  const seen = new Set<string>();

  return (data?.tracks?.items ?? [])
    .filter(isSpotifyTrack)
    .filter((track) => track.artists?.some((artist) => artist.id === artistId))
    .sort((left, right) => {
      const leftPrimaryArtist = left.artists?.[0]?.id === artistId ? 1 : 0;
      const rightPrimaryArtist = right.artists?.[0]?.id === artistId ? 1 : 0;
      if (leftPrimaryArtist !== rightPrimaryArtist) {
        return rightPrimaryArtist - leftPrimaryArtist;
      }

      return (right.popularity ?? 0) - (left.popularity ?? 0);
    })
    .filter((track) => {
      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    })
    .slice(0, 10)
    .map(mapTrack);
}

export async function getSpotifyProfileMarket(
  token: string,
): Promise<string | null> {
  const data = await spotifyFetch<{ country?: string }>("/me", token);
  return data?.country ?? null;
}

export async function searchTracks(
  query: string,
  token: string,
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    token,
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
    artists: (data?.artists?.items ?? [])
      .filter(isSpotifyArtist)
      .map(mapArtist),
    playlists: (data?.playlists?.items ?? [])
      .filter(isSpotifyPlaylist)
      .map(mapPlaylist),
  };
}

export async function getAlbumTracks(
  token: string,
  albumId: string,
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<AlbumDetailsResponse>(`/albums/${albumId}`, token);

  if (!data?.tracks?.items) {
    return [];
  }

  const album: SpotifyAlbum = {
    id: data.id,
    name: data.name,
    album_type: data.album_type,
    images: data.images,
    release_date: data.release_date,
    total_tracks: data.total_tracks,
    artists: data.artists,
  };

  return data.tracks.items
    .filter((track): track is Omit<SpotifyApiTrack, "album"> => !!track && !!track.id)
    .map((track) => mapTrack({ ...track, album }));
}

export interface ArtistPageDataResult {
  page: SpotifyArtistPageData;
  usedReleaseFallback: boolean;
}

async function getArtistReleasesResult(
  token: string,
  artistId: string,
  includeGroups: "album" | "single",
  market?: string | null,
) {
  const releasesQuery = new URLSearchParams({
    include_groups: includeGroups,
    limit: "10",
    ...(market ? { market } : {}),
  }).toString();

  try {
    const data = await spotifyFetch<ArtistAlbumsResponse>(
      `/artists/${artistId}/albums?${releasesQuery}`,
      token,
    );

    return {
      releases: (data?.items ?? [])
        .filter(isSpotifyAlbum)
        .map(mapAlbumRelease)
        .filter((album) => album.id !== ""),
      usedFallback: false,
    };
  } catch (error) {
    if (
      error instanceof SpotifyApiError &&
      error.status !== 401 &&
      error.status !== 403
    ) {
      return {
        releases: [],
        usedFallback: true,
      };
    }

    throw error;
  }
}

export async function getArtistPageDataResult(
  token: string,
  artistId: string,
  market?: string | null,
): Promise<ArtistPageDataResult> {
  const artistData = await spotifyFetch<ArtistResponse>(`/artists/${artistId}`, token);
  if (!artistData) {
    throw new SpotifyApiError(404, `Artist ${artistId} not found`);
  }
  const topTracksData = await searchArtistTracks(
    token,
    artistId,
    artistData.name,
    market,
  );
  const albumsResult = await getArtistReleasesResult(
    token,
    artistId,
    "album",
    market,
  );
  const singlesResult = await getArtistReleasesResult(
    token,
    artistId,
    "single",
    market,
  );

  return {
    page: {
      artist: mapArtist(artistData),
      topTracks: topTracksData,
      albums: albumsResult.releases,
      singles: singlesResult.releases,
    },
    usedReleaseFallback:
      albumsResult.usedFallback || singlesResult.usedFallback,
  };
}

export async function getArtistPageData(
  token: string,
  artistId: string,
  market?: string | null,
): Promise<SpotifyArtistPageData> {
  const result = await getArtistPageDataResult(token, artistId, market);
  return result.page;
}
