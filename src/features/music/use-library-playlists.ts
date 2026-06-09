import { useCallback } from "react";

import { useStableAction } from "@/hooks/use-stable-action";
import {
  getLibraryPlaylists,
  type Playlist,
} from "./library-client";

/**
 * Loads the listener's Apple Music library playlists. Disabled until Apple is
 * connected (the Music User Token is required), so callers pass the authorized
 * flag from `playbackConnection.status`.
 */
export function useLibraryPlaylists(enabled: boolean) {
  return useStableAction<Playlist[]>({
    enabled,
    load: useCallback(async () => getLibraryPlaylists(), []),
  });
}
