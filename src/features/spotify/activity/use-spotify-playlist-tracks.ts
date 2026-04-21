import type { Dispatch, SetStateAction } from "react";
import { useCallback, useRef } from "react";

import { spotifyActivityClient } from "@/features/spotify/client";
import type { SpotifyTrack } from "@/types";
import type { Playlist } from "@/types/spotify-activity";

export function useSpotifyPlaylistTracks({
  setPlaylists,
}: {
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

      const tracks = await spotifyActivityClient.getPlaylistTracks(playlistId);
      playlistTracksRef.current.set(playlistId, tracks);
      setPlaylists((previous) =>
        previous.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, tracks } : playlist,
        ),
      );
      return tracks ?? [];
    },
    [setPlaylists],
  );

  return {
    clearPlaylistTracks,
    getPlaylistTracks,
  };
}
