import { PauseIcon, PlayIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";

export type PlayButtonProps = ButtonProps & {
  pausable?: boolean;
  playing?: boolean;
};

export const PlayButton: FC<PlayButtonProps> = ({
  pausable = true,
  playing = false,
  ...props
}) => {
  return (
    <Button size="icon-sm" {...props}>
      {pausable && playing ? (
        <PauseIcon fill="currentColor" strokeWidth={0} />
      ) : (
        <PlayIcon fill="currentColor" strokeWidth={0} />
      )}
    </Button>
  );
};
