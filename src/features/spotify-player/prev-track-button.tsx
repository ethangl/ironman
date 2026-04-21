import { SkipBackIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const PrevTrackButton: FC<ButtonProps> = ({ ...props }) => {
  const { prevTrack } = useNowPlaying();
  return (
    <Button
      size="icon-lg"
      className="bg-white/10 hover:bg-white/5"
      onClick={prevTrack}
      {...props}
    >
      <SkipBackIcon />
    </Button>
  );
};
