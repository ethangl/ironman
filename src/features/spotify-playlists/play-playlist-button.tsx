import { FC, useContext } from "react";

import { PlayButton } from "@/components/play-button";
import type { Track } from "@/features/spotify-client/types";
import { WebPlayerActionsContext } from "../spotify-player/use-web-player";

export type PlayPlaylistButtonProps = {
  disabled?: boolean;
  onPlay?: (tracks: Track[]) => void;
  playable?: boolean;
  tracks: Track[];
};

export const PlayPlaylistButton: FC<PlayPlaylistButtonProps> = ({
  disabled = false,
  onPlay,
  playable = true,
  tracks,
}) => {
  const webPlayerActions = useContext(WebPlayerActionsContext);

  const handlePlay =
    onPlay ??
    (playable && tracks.length > 0 && webPlayerActions
      ? (nextTracks: Track[]) => {
          void webPlayerActions.playTracks(nextTracks);
        }
      : undefined);

  if (!handlePlay) {
    return null;
  }

  return (
    <PlayButton
      size="icon"
      pausable={false}
      disabled={disabled}
      onClick={() => handlePlay(tracks)}
    />
  );
};
