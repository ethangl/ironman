import type { Track } from "@/features/catalog/types";

/** A catalog song, shaped exactly as the queue needs it (mirrors CatalogTrack). */
export interface CatalogSong {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumImage: string | null;
  durationMs: number;
  isrc: string | null;
}

/**
 * Map catalog songs to the `Track` shape the shared `Tracks` UI renders.
 * A null ISRC is dropped (the field is optional on `Track`).
 */
export function toTracks(
  tracks: readonly CatalogSong[],
): Track[] {
  return tracks.map((song) => ({
    id: song.id,
    name: song.name,
    artist: song.artist,
    albumName: song.albumName,
    albumImage: song.albumImage,
    durationMs: song.durationMs,
    ...(song.isrc ? { isrc: song.isrc } : {}),
  }));
}
