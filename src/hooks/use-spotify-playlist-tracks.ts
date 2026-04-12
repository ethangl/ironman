import type { Dispatch, SetStateAction } from "react";
import { useCallback, useRef } from "react";

import type { AppDataClient } from "@/data/client";
import type { Playlist, PlaylistTrack } from "@/hooks/use-spotify-activity";

export function useSpotifyPlaylistTracks({
  client,
  setPlaylists,
}: {
  client: AppDataClient;
  setPlaylists: Dispatch<SetStateAction<Playlist[]>>;
}) {
  const playlistTracksRef = useRef(new Map<string, Playlist["tracks"]>());

  const clearPlaylistTracks = useCallback(() => {
    playlistTracksRef.current.clear();
  }, []);

  const getPlaylistTracks = useCallback(
    async (playlistId: string): Promise<PlaylistTrack[]> => {
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
