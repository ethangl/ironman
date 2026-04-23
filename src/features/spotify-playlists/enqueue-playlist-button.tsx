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
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTracks = rooms?.enqueueTracks;

  const { loadingPlaylistId, loadPlaylistTracks } = usePlaylistTracksLoader();

  const canEnqueueToActiveRoom =
    !!activeRoom?.playback.canEnqueue && !!enqueueTracks;

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
            size="icon-lg"
            disabled={
              !canEnqueueToActiveRoom || loadingPlaylistId === playlist.id
            }
            onClick={() => void enqueuePlaylist(playlist)}
            aria-label={`Queue ${playlist.name}`}
          >
            <ListPlusIcon />
          </Button>
        }
      />
      <TooltipContent>
        {canEnqueueToActiveRoom ? "Add Playlist to Queue" : "Enter a room!"}
      </TooltipContent>
    </Tooltip>
  );
};
