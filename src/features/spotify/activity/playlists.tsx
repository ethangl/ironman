import { FC, useCallback } from "react";
import { PlusIcon } from "lucide-react";
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
import { useSpotifyClient } from "@/features/spotify/client";
import type { SpotifyPlaylist, SpotifyTrack } from "@/types";
import { PlaylistCell } from "./playlist-cell";
import { usePlayableTrackCollection } from "./use-playable-track-collection";

export type PlaylistsProps = {
  action?: React.ReactNode;
  playlists: SpotifyPlaylist[];
  title: string;
};

export const Playlists: FC<PlaylistsProps> = ({ action, playlists, title }) => {
  const client = useSpotifyClient();
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTracks = rooms?.enqueueTracks;

  const loadTracks = useCallback(
    async (playlist: SpotifyPlaylist): Promise<SpotifyTrack[]> => {
      return client.spotifyActivity.getPlaylistTracks(playlist.id);
    },
    [client],
  );

  const { getCachedTracks, loadItemTracks, loadingItemId, playItem } =
    usePlayableTrackCollection<SpotifyPlaylist, SpotifyTrack>({
      emptyMessage: "That playlist does not have any playable tracks.",
      fallbackErrorMessage: "Could not load playlist tracks.",
      loadTracks,
    });
  const canEnqueueToActiveRoom =
    !!activeRoom?.playback.canEnqueue && !!enqueueTracks;

  const enqueuePlaylist = useCallback(
    async (playlist: SpotifyPlaylist) => {
      if (!enqueueTracks) {
        return;
      }

      try {
        const tracks = await loadItemTracks(playlist);
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
    [enqueueTracks, loadItemTracks],
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
                tracks={getCachedTracks(playlist.id)}
                onPlay={() => void playItem(playlist)}
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
