import { SkipForwardIcon } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const SkipForwardButton: FC = () => {
  const { isRoomMode, roomPlayback } = useNowPlaying();

  if (!isRoomMode || !roomPlayback || !roomPlayback.canSkip) {
    return null;
  }

  return (
    <Button
      variant="overlay"
      size="icon"
      disabled={!roomPlayback.hasTrack}
      onClick={() => roomPlayback.skip()}
    >
      <SkipForwardIcon fill="currentColor" strokeWidth={1} />
    </Button>
  );
};
