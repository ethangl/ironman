import { FC, useCallback } from "react";
import { useParams } from "react-router-dom";

import { SidebarContent } from "@/components/sidebar";
import type { SpotifyTrack } from "@/features/spotify-client/types";
import { SpotifyHeader } from "@/features/spotify-shell/spotify-header";
import { Tracks } from "@/features/spotify-tracks";
import { useStableAction } from "@/hooks/use-stable-action";
import { EnqueuePlaylistButton } from "./enqueue-playlist-button";
import {
  getLibraryPlaylist,
  getLibraryPlaylistTracks,
  type Playlist as PlaylistData,
} from "./library-client";

export const Playlist: FC = () => {
  const { playlistId } = useParams();

  const { data: playlist } = useStableAction<PlaylistData | null>({
    enabled: Boolean(playlistId),
    keepDataOnLoad: false,
    load: useCallback(
      async () => (playlistId ? getLibraryPlaylist(playlistId) : null),
      [playlistId],
    ),
  });

  const { data: tracks } = useStableAction<SpotifyTrack[]>({
    enabled: Boolean(playlistId),
    keepDataOnLoad: false,
    load: useCallback(
      async () => (playlistId ? getLibraryPlaylistTracks(playlistId) : []),
      [playlistId],
    ),
  });

  if (!playlist) {
    return null;
  }

  return (
    <>
      <SpotifyHeader href="/home" title="Playlist" />
      <SidebarContent>
        <Tracks
          title={playlist.name}
          description={`${tracks?.length ?? 0} songs`}
          action={
            <EnqueuePlaylistButton
              tracks={tracks ?? []}
              name={playlist.name}
            />
          }
          tracks={tracks ?? []}
        />
      </SidebarContent>
    </>
  );
};
