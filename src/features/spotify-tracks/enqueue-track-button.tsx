import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SpotifyTrack } from "@/features/spotify-client/types";
import { useOptionalRooms } from "../rooms/runtime/rooms-provider";

export function EnqueueTrackButton({ track }: { track: SpotifyTrack }) {
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTrack = rooms?.enqueueTrack;

  const canEnqueue = activeRoom?.playback.canEnqueue && enqueueTrack;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-lg"
            disabled={!canEnqueue}
            onClick={() => {
              if (!enqueueTrack) {
                return null;
              }
              void enqueueTrack(track);
            }}
          >
            <PlusIcon />
          </Button>
        }
      />
      <TooltipContent>
        {canEnqueue ? "Add Playlist to Queue" : "Enter a room!"}
      </TooltipContent>
    </Tooltip>
  );
}
