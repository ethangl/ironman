import { FC, useCallback } from "react";
import { useParams } from "react-router-dom";

import { SidebarContent } from "@/components/sidebar";
import type { Track } from "@/features/catalog/types";
import { AppHeader } from "@/features/shell/app-header";
import { Tracks } from "@/features/tracks";
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

  const { data: tracks } = useStableAction<Track[]>({
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
      <AppHeader href="/home" title="Playlist" />
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
