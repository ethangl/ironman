import { useCallback, useState } from "react";

import type {
  SpotifyPlaylist,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { getSpotifyPlaylistTracks } from "./spotify-playlist-client";

export function usePlaylistTracksLoader() {
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(
    null,
  );

  const loadPlaylistTracks = useCallback(
    async (playlist: SpotifyPlaylist): Promise<SpotifyTrack[]> => {
      setLoadingPlaylistId(playlist.id);

      try {
        return await getSpotifyPlaylistTracks(playlist.id);
      } finally {
        setLoadingPlaylistId((current) =>
          current === playlist.id ? null : current,
        );
      }
    },
    [],
  );

  return {
    loadingPlaylistId,
    loadPlaylistTracks,
  };
}
