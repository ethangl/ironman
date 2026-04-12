import { PauseIcon, PlayIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PlayButtonProps = ButtonProps & {
  pausable?: boolean;
  playing?: boolean;
};

export const PlayButton: FC<PlayButtonProps> = ({
  className,
  pausable = true,
  playing = false,
  size = "icon-sm",
  ...props
}) => {
  return (
    <Button
      variant="ghost"
      size={size}
      className={cn("bg-white/10 hover:bg-white/5 border-0", className)}
      {...props}
    >
      {pausable && playing ? (
        <PauseIcon fill="currentColor" strokeWidth={0} />
      ) : (
        <PlayIcon fill="currentColor" strokeWidth={0} />
      )}
    </Button>
  );
};
