import { FC, useCallback } from "react";
import { useParams } from "react-router-dom";

import { SidebarContent } from "@/components/sidebar";
import type {
  SpotifyPlaylist,
  SpotifyTrack,
} from "@/features/spotify-client/types";
import { Tracks } from "@/features/spotify-tracks";
import { useStableAction } from "@/hooks/use-stable-action";
import { SpotifyHeader } from "../spotify-shell/spotify-header";
import { EnqueuePlaylistButton } from "./enqueue-playlist-button";
import {
  getSpotifyPlaylist,
  getSpotifyPlaylistTracks,
} from "./spotify-playlist-client";

export const Playlist: FC = () => {
  const { playlistId } = useParams();

  const { data: playlist } = useStableAction<SpotifyPlaylist | null>({
    enabled: Boolean(playlistId),
    keepDataOnLoad: false,
    load: useCallback(async () => {
      if (!playlistId) {
        return null;
      }

      return await getSpotifyPlaylist(playlistId);
    }, [playlistId]),
  });

  const { data: tracks } = useStableAction<SpotifyTrack[]>({
    enabled: Boolean(playlistId),
    keepDataOnLoad: false,
    load: useCallback(async () => {
      if (!playlistId) {
        return [];
      }

      return await getSpotifyPlaylistTracks(playlistId);
    }, [playlistId]),
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
          description={
            playlist.owner
              ? `${tracks?.length} songs by ${playlist.owner}`
              : `${tracks?.length} songs`
          }
          action={<EnqueuePlaylistButton playlist={playlist} />}
          tracks={tracks ?? []}
        />
      </SidebarContent>
    </>
  );
};
