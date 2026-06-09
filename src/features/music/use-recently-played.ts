import { useCallback } from "react";

import type { SpotifyTrack } from "@/features/spotify-client/types";
import { useStableAction } from "@/hooks/use-stable-action";
import { getRecentlyPlayed } from "./library-client";

/**
 * Loads the listener's recently-played Apple Music tracks. Disabled until Apple
 * is connected (the Music User Token is required), so callers pass the
 * authorized flag from `playbackConnection.status`.
 */
export function useRecentlyPlayed(enabled: boolean) {
  return useStableAction<SpotifyTrack[]>({
    enabled,
    load: useCallback(async () => getRecentlyPlayed(), []),
  });
}
