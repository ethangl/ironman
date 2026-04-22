import { SkipBackIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const PrevTrackButton: FC<ButtonProps> = ({ ...props }) => {
  const { prevTrack } = useNowPlaying();
  return (
    <Button variant="outline" size="icon" onClick={prevTrack} {...props}>
      <SkipBackIcon />
    </Button>
  );
};
