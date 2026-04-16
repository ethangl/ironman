import { useMemo } from "react";

import type { Track } from "@/types";
import { useWebPlayerState } from "./use-web-player";

export interface PlayerQueueListingItem {
  index: number;
  isActive: boolean;
  track: Track;
}

export function usePlayerQueueListing() {
  const { currentTrack, queue, queueIndex, shuffled } = useWebPlayerState();

  return useMemo(() => {
    const activeTrackId = currentTrack?.id ?? null;
    const activeIndex =
      activeTrackId === null
        ? -1
        : queue.findIndex((track) => track.id === activeTrackId);

    return {
      tracks: queue,
      items: queue.map((track, index) => ({
        index,
        isActive: index === activeIndex,
        track,
      })),
      activeTrackId,
      activeIndex,
      playbackIndex: queueIndex,
      shuffled,
      hasTracks: queue.length > 0,
    };
  }, [currentTrack?.id, queue, queueIndex, shuffled]);
}
