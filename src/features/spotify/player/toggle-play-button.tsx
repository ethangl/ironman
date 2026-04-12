import { PlayButton, type PlayButtonProps } from "@/components/play-button";

import { useNowPlaying } from "./use-now-playing";

type TogglePlayButtonProps = Omit<PlayButtonProps, "onClick" | "playing">;

export function TogglePlayButton(props: TogglePlayButtonProps) {
  const { paused, togglePlay } = useNowPlaying();

  return <PlayButton {...props} playing={!paused} onClick={togglePlay} />;
}
