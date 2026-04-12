import { useEffect, useRef } from "react";

import type { SearchClient } from "@/features/spotify/client/search-client";
import type { SpotifyTrack, Track } from "@/types";

export function useChallengeAutoplay({
  canControlPlayback,
  hasSession,
  lockInTrackId,
  playTrack,
  searchTracks,
}: {
  canControlPlayback: boolean;
  hasSession: boolean;
  lockInTrackId: string | null;
  playTrack: (track: Track) => Promise<void>;
  searchTracks: SearchClient["searchTracks"];
}) {
  const attemptedTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lockInTrackId) {
      attemptedTrackIdRef.current = null;
      return;
    }

    if (
      !canControlPlayback ||
      !hasSession ||
      attemptedTrackIdRef.current === lockInTrackId
    ) {
      return;
    }

    attemptedTrackIdRef.current = lockInTrackId;

    searchTracks(`track:${lockInTrackId}`)
      .then((tracks: SpotifyTrack[]) => {
        const match = tracks.find((track) => track.id === lockInTrackId);
        if (match) {
          void playTrack(match);
        }
      })
      .catch(() => {});
  }, [canControlPlayback, hasSession, lockInTrackId, playTrack, searchTracks]);
}
