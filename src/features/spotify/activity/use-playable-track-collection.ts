import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { useWebPlayerActions } from "@/features/spotify/player";
import type { Track } from "@/types";

type Identifiable = {
  id: string;
};

export function usePlayableTrackCollection<TItem extends Identifiable>({
  emptyMessage,
  fallbackErrorMessage,
  loadTracks,
}: {
  emptyMessage: string;
  fallbackErrorMessage: string;
  loadTracks: (item: TItem) => Promise<Track[]>;
}) {
  const { playTracks } = useWebPlayerActions();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const tracksByIdRef = useRef(new Map<string, Track[]>());

  const getCachedTracks = useCallback((itemId: string) => {
    return tracksByIdRef.current.get(itemId) ?? [];
  }, []);

  const loadItemTracks = useCallback(
    async (item: TItem) => {
      const cached = tracksByIdRef.current.get(item.id);
      if (cached) {
        return cached;
      }

      setLoadingItemId(item.id);
      try {
        const tracks = await loadTracks(item);
        tracksByIdRef.current.set(item.id, tracks);
        return tracks;
      } finally {
        setLoadingItemId((current) => (current === item.id ? null : current));
      }
    },
    [loadTracks],
  );

  const playItem = useCallback(
    async (item: TItem) => {
      try {
        const tracks = await loadItemTracks(item);

        if (tracks.length === 0) {
          toast.error(emptyMessage);
          return;
        }

        await playTracks(tracks);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : fallbackErrorMessage,
        );
      }
    },
    [emptyMessage, fallbackErrorMessage, loadItemTracks, playTracks],
  );

  return {
    getCachedTracks,
    loadItemTracks,
    loadingItemId,
    playItem,
  };
}
