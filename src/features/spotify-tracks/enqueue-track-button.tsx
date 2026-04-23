import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SpotifyTrack } from "@/features/spotify-client/types";
import { useOptionalRooms } from "../rooms/runtime/rooms-provider";

export function EnqueueTrackButton({ track }: { track: SpotifyTrack }) {
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTrack = rooms?.enqueueTrack;

  if (!activeRoom?.playback.canEnqueue || !enqueueTrack) {
    return null;
  }

  return (
    <Button size="icon" onClick={() => void enqueueTrack(track)}>
      <PlusIcon />
    </Button>
  );
}
