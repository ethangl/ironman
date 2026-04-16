import { useEffect } from "react";

import { convexReccobeatsClient } from "./reccobeats-client";

export function useEnsureTrackAudioFeatures(trackId: string | null) {
  useEffect(() => {
    if (!trackId) {
      return;
    }

    void convexReccobeatsClient.ensureTrackAudioFeatures([trackId]).catch(
      (error) => {
        if (!import.meta.env.DEV) {
          return;
        }

        console.warn("Failed to ensure track audio features.", error);
      },
    );
  }, [trackId]);
}
