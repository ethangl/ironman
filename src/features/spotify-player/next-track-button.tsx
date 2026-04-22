import { SkipForwardIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const NextTrackButton: FC<ButtonProps> = ({ ...props }) => {
  const { nextTrack } = useNowPlaying();
  return (
    <Button variant="outline" size="icon" onClick={nextTrack} {...props}>
      <SkipForwardIcon />
    </Button>
  );
};
