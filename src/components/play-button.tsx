import { PauseIcon, PlayIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNowPlaying } from "./player/use-now-playing";

export type PlayButtonProps = ButtonProps & { pausable?: boolean };

export const PlayButton: FC<PlayButtonProps> = ({
  className,
  pausable = true,
  size = "icon-sm",
  ...props
}) => {
  const { paused, togglePlay } = useNowPlaying();

  return (
    <Button
      size={size}
      onClick={togglePlay}
      className={cn("bg-white/10 hover:bg-white/5", className)}
      {...props}
    >
      {pausable && !paused ? (
        <PauseIcon fill="currentColor" strokeWidth={0} />
      ) : (
        <PlayIcon fill="currentColor" strokeWidth={0} />
      )}
    </Button>
  );
};
