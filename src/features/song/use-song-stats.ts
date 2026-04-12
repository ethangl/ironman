import type { SongStats } from "@shared/song-stats";
import { api } from "@api";
import { useStableQuery } from "@/hooks/use-stable-query";

export function useSongStats(trackId: string) {
  const stats = useStableQuery(api.songs.get, trackId ? { trackId } : "skip");

  if (!trackId) {
    return { stats: null, loading: false };
  }

  return {
    stats: (stats as SongStats | null | undefined) ?? null,
    loading: stats === undefined,
  };
}
