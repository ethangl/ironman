import { PlayIcon, SquareIcon } from "lucide-react";
import { FC } from "react";

import { Button, ButtonProps } from "@/components/ui/button";

export type StopButtonProps = ButtonProps & {
  playing?: boolean;
};

export const StopButton: FC<StopButtonProps> = ({
  playing = false,
  ...props
}) => {
  return (
    <Button size="icon-sm" {...props}>
      {playing ? (
        <SquareIcon fill="currentColor" strokeWidth={0} />
      ) : (
        <PlayIcon fill="currentColor" strokeWidth={0} />
      )}
    </Button>
  );
};
