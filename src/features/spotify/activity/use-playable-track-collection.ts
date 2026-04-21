import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useWebPlayerActions } from "@/features/spotify/player";
import type { Track } from "@/types";

type Identifiable = {
  id: string;
};

export function usePlayableTrackCollection<
  TItem extends Identifiable,
  TTrack extends Track = Track,
>({
  emptyMessage,
  fallbackErrorMessage,
  loadTracks,
}: {
  emptyMessage: string;
  fallbackErrorMessage: string;
  loadTracks: (item: TItem) => Promise<TTrack[]>;
}) {
  const { playTracks } = useWebPlayerActions();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const loadItemTracks = useCallback(
    async (item: TItem) => {
      setLoadingItemId(item.id);
      try {
        return await loadTracks(item);
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
    loadItemTracks,
    loadingItemId,
    playItem,
  };
}
