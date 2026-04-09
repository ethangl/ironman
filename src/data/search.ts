import { requestJson } from "@/data/http";
import { SpotifySearchResults, SpotifyTrack } from "@/types";

export function searchSpotifyResults(query: string, signal?: AbortSignal) {
  return requestJson<SpotifySearchResults>(
    `/api/search?q=${encodeURIComponent(query)}`,
    { signal },
    "Could not search Spotify.",
  );
}

export async function searchTracks(query: string) {
  const data = await searchSpotifyResults(query);
  return (data.tracks ?? []) as SpotifyTrack[];
}
