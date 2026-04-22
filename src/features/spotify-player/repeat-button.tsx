import { RepeatIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const RepeatButton: FC<ButtonProps> = ({ ...props }) => {
  const { toggleShuffle } = useNowPlaying();
  return (
    <Button size="icon-sm" onClick={toggleShuffle} {...props}>
      <RepeatIcon />
    </Button>
  );
};
