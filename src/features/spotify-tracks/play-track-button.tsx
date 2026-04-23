import { FC, useContext } from "react";

import { PlayButton } from "@/components/play-button";
import type { Track } from "@/features/spotify-client/types";
import { WebPlayerActionsContext } from "../spotify-player/use-web-player";

export type PlayTrackButtonProps = {
  onPlay?: (track: Track) => void;
  playable?: boolean;
  track: Track;
};

export const PlayTrackButton: FC<PlayTrackButtonProps> = ({
  onPlay,
  playable = true,
  track,
}) => {
  const webPlayerActions = useContext(WebPlayerActionsContext);

  const handlePlay =
    onPlay ??
    (playable && webPlayerActions
      ? (nextTrack: Track) => {
          void webPlayerActions.playTrack(nextTrack);
        }
      : undefined);

  if (!handlePlay) {
    return null;
  }

  return (
    <PlayButton
      size="icon-lg"
      pausable={false}
      onClick={() => handlePlay(track)}
    />
  );
};
