import { spotifyFetch, spotifyFetchOptional } from "./client";
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

interface SpotifyProfileResponse {
  country?: string;
}

interface ArtistAlbumsResponse {
  items?: Array<SpotifyAlbum | null>;
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
    .filter((track) => track.artists?.some((artist) => artist.id === artistId))
    .filter((track) => {
      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    })
    .map(mapTrack);
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
    searchArtistTracks(token, artistId, artistData.name, market),
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
