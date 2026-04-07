"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNowPlaying } from "./use-now-playing";

export type PlayButtonProps = ButtonProps & { pausable?: boolean };

export const PlayButton: FC<PlayButtonProps> = ({
  className,
  pausable = true,
  ...props
}) => {
  const { paused, togglePlay } = useNowPlaying();

  return (
    <Button
      size="icon-sm"
      onClick={togglePlay}
      className={cn("bg-white/10 hover:bg-white/5", className)}
      {...props}
    >
      {pausable && !paused ? <PauseIcon /> : <PlayIcon />}
    </Button>
  );
};
