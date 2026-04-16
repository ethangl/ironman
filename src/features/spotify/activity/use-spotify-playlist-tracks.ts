import type { Dispatch, SetStateAction } from "react";
import { useCallback, useRef } from "react";

import type { SpotifyClient } from "@/features/spotify/client";
import type { SpotifyTrack } from "@/types";
import type { Playlist } from "@/types/spotify-activity";

export function useSpotifyPlaylistTracks({
  client,
  setPlaylists,
}: {
  client: SpotifyClient;
  setPlaylists: Dispatch<SetStateAction<Playlist[]>>;
}) {
  const playlistTracksRef = useRef(new Map<string, SpotifyTrack[]>());

  const clearPlaylistTracks = useCallback(() => {
    playlistTracksRef.current.clear();
  }, []);

  const getPlaylistTracks = useCallback(
    async (playlistId: string): Promise<SpotifyTrack[]> => {
      const cached = playlistTracksRef.current.get(playlistId);
      if (cached) {
        return cached;
      }

      const tracks = await client.spotifyActivity.getPlaylistTracks(playlistId);
      playlistTracksRef.current.set(playlistId, tracks);
      setPlaylists((previous) =>
        previous.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, tracks } : playlist,
        ),
      );
      return tracks ?? [];
    },
    [client, setPlaylists],
  );

  return {
    clearPlaylistTracks,
    getPlaylistTracks,
  };
}
