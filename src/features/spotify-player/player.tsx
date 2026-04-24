import { FC } from "react";

import { cn } from "@/lib/utils";
import { StandardPlayer } from "./standard-player";
import { useNowPlaying } from "./use-now-playing";

export const Player: FC = () => {
  const { expanded, setExpanded } = useNowPlaying();
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 pointer-events-none transition-all z-45",
          expanded && "backdrop-blur-xs pointer-events-auto",
        )}
        onClick={() => setExpanded(false)}
      />
      <StandardPlayer />
    </>
  );
};
