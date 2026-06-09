import { useCallback } from "react";

import {
  getAppleLibraryArtists,
  type AppleArtistSummary,
} from "./apple-library-client";
import { useStableAction } from "@/hooks/use-stable-action";

/**
 * Loads the listener's Apple Music library artists (resolved to their catalog
 * ids). Disabled until Apple is connected (the Music User Token is required), so
 * callers pass the authorized flag from `playbackConnection.status`.
 */
export function useAppleLibraryArtists(enabled: boolean) {
  return useStableAction<AppleArtistSummary[]>({
    enabled,
    load: useCallback(async () => getAppleLibraryArtists(), []),
  });
}
