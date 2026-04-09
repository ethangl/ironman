"use client";

import { FastForwardIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const NextTrackButton: FC<ButtonProps> = ({ ...props }) => {
  const { nextTrack } = useNowPlaying();
  return (
    <Button
      size="icon-sm"
      className="bg-white/10 hover:bg-white/5"
      onClick={nextTrack}
      {...props}
    >
      <FastForwardIcon fill="currentColor" strokeWidth={0} />
    </Button>
  );
};
