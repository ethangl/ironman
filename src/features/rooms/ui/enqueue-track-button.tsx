import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SpotifyTrack } from "@/types";
import { useOptionalRooms } from "../runtime/rooms-provider";

export function EnqueueTrackButton({ track }: { track: SpotifyTrack }) {
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTrack = rooms?.enqueueTrack;

  if (!activeRoom?.playback.canEnqueue || !enqueueTrack) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => void enqueueTrack(track)}
      aria-label={`Queue ${track.name}`}
    >
      <PlusIcon />
    </Button>
  );
}
