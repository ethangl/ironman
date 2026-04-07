"use client";

import { SkullIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const HardcoreButton: FC<ButtonProps> = ({ ...props }) => {
  const { streak, activateHardcore } = useNowPlaying();
  return (
    <Button
      size="icon-sm"
      className="group bg-white/10 hover:bg-white/5"
      disabled={!streak?.active || streak.hardcore}
      onClick={activateHardcore}
      {...props}
    >
      <SkullIcon className="size-3.5" />
    </Button>
  );
};
