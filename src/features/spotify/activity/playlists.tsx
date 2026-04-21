import { PlusIcon } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { toast } from "sonner";

import { List, ListItem } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { useOptionalRooms } from "@/features/rooms";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify/client/spotify-convex-client";
import { useWebPlayerActions } from "@/features/spotify/player";
import type { SpotifyPlaylist, SpotifyTrack } from "@/types";
import { api } from "@api";
import { PlaylistCell } from "./playlist-cell";

export type PlaylistsProps = {
  action?: React.ReactNode;
  playlists: SpotifyPlaylist[];
  title: string;
};

export const Playlists: FC<PlaylistsProps> = ({ action, playlists, title }) => {
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTracks = rooms?.enqueueTracks;
  const { playTracks } = useWebPlayerActions();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const loadPlaylistTracks = useCallback(
    async (playlist: SpotifyPlaylist): Promise<SpotifyTrack[]> => {
      setLoadingItemId(playlist.id);

      try {
        const client = await getAuthenticatedSpotifyConvexClient();

        return await client.action(api.spotify.playlistTracks, {
          playlistId: playlist.id,
        });
      } finally {
        setLoadingItemId((current) =>
          current === playlist.id ? null : current,
        );
      }
    },
    [],
  );

  const canEnqueueToActiveRoom =
    !!activeRoom?.playback.canEnqueue && !!enqueueTracks;

  const playPlaylist = useCallback(
    async (playlist: SpotifyPlaylist) => {
      try {
        const tracks = await loadPlaylistTracks(playlist);

        if (tracks.length === 0) {
          toast.error("That playlist does not have any playable tracks.");
          return;
        }

        await playTracks(tracks);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load playlist tracks.",
        );
      }
    },
    [loadPlaylistTracks, playTracks],
  );

  const enqueuePlaylist = useCallback(
    async (playlist: SpotifyPlaylist) => {
      if (!enqueueTracks) {
        return;
      }

      try {
        const tracks = await loadPlaylistTracks(playlist);
        if (tracks.length === 0) {
          toast.error("That playlist does not have any playable tracks.");
          return;
        }

        await enqueueTracks(tracks);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load playlist tracks.",
        );
      }
    },
    [enqueueTracks, loadPlaylistTracks],
  );

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          {title}
          {action}
        </SectionTitle>
      </SectionHeader>
      <SectionContent>
        <List count={playlists.length}>
          {playlists.map((playlist) => (
            <ListItem key={playlist.id}>
              <PlaylistCell
                disabled={loadingItemId === playlist.id}
                image={playlist.image}
                name={playlist.name}
                subtitle={
                  playlist.owner
                    ? `${playlist.trackCount} songs by ${playlist.owner}`
                    : `${playlist.trackCount} songs`
                }
                tracks={[]}
                onPlay={() => void playPlaylist(playlist)}
              >
                {canEnqueueToActiveRoom ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={loadingItemId === playlist.id}
                    onClick={() => void enqueuePlaylist(playlist)}
                    aria-label={`Queue ${playlist.name}`}
                  >
                    <PlusIcon />
                  </Button>
                ) : null}
              </PlaylistCell>
            </ListItem>
          ))}
        </List>
      </SectionContent>
    </Section>
  );
};
