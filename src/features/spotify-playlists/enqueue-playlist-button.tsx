import { ListPlusIcon } from "lucide-react";
import { FC, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOptionalRooms } from "@/features/rooms";
import type { SpotifyPlaylist } from "@/features/spotify-client/types";
import { usePlaylistTracksLoader } from "./use-playlist-tracks-loader";

export type EnqueuePlaylistButtonProps = {
  playlist: SpotifyPlaylist;
};

export const EnqueuePlaylistButton: FC<EnqueuePlaylistButtonProps> = ({
  playlist,
}) => {
  const rooms = useOptionalRooms();
  const { loadingPlaylistId, loadPlaylistTracks } = usePlaylistTracksLoader();

  if (!rooms) {
    return null;
  }

  const { activeRoom, enqueueTracks } = rooms;

  const canEnqueueToActiveRoom =
    !!activeRoom?.playback.canEnqueue && !!enqueueTracks;

  if (!canEnqueueToActiveRoom) {
    return null;
  }

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
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            disabled={loadingPlaylistId === playlist.id}
            onClick={() => void enqueuePlaylist(playlist)}
            aria-label={`Queue ${playlist.name}`}
          >
            <ListPlusIcon />
          </Button>
        }
      />
      <TooltipContent>Add Playlist to Queue</TooltipContent>
    </Tooltip>
  );
};
