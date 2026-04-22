import { ShuffleIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const ShuffleButton: FC<ButtonProps> = ({ ...props }) => {
  const { toggleShuffle } = useNowPlaying();
  return (
    <Button size="icon-sm" onClick={toggleShuffle} {...props}>
      <ShuffleIcon />
    </Button>
  );
};
