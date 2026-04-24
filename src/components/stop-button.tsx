import { PlayIcon, SquareIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "@/features/spotify-player/use-now-playing";

export const StopButton: FC<ButtonProps> = ({ ...props }) => {
  const { isRoomMode, roomPlayback } = useNowPlaying();

  if (!isRoomMode) {
    return null;
  }

  const playing = roomPlayback?.canToggleListening && !roomPlayback.paused;

  return (
    <Button
      variant="ghost"
      size="icon"
      {...props}
      disabled={!roomPlayback?.canToggleListening}
      onClick={() => roomPlayback?.toggleListening()}
    >
      {playing ? (
        <SquareIcon fill="currentColor" strokeWidth={0} />
      ) : (
        <PlayIcon fill="currentColor" strokeWidth={0} />
      )}
    </Button>
  );
};
