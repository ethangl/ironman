import { RepeatIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useNowPlaying } from "./use-now-playing";

export const RepeatButton: FC<ButtonProps> = ({ ...props }) => {
  const { toggleShuffle } = useNowPlaying();
  return (
    <Button
      size="icon-sm"
      className="bg-white/10 hover:bg-white/5"
      onClick={toggleShuffle}
      {...props}
    >
      <RepeatIcon />
    </Button>
  );
};
