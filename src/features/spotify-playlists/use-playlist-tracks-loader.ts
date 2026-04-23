import { useCallback, useState } from "react";

import type { SpotifyTrack } from "@/features/spotify-client/types";
import { getSpotifyPlaylistTracks } from "./spotify-playlist-client";

export function usePlaylistTracksLoader() {
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(
    null,
  );

  const loadPlaylistTracks = useCallback(
    async (playlistId: string): Promise<SpotifyTrack[]> => {
      setLoadingPlaylistId(playlistId);

      try {
        return await getSpotifyPlaylistTracks(playlistId);
      } finally {
        setLoadingPlaylistId((current) =>
          current === playlistId ? null : current,
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
