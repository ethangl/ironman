import { TrackCell, type TrackCellProps } from "@/components/track-cell";

import { useWebPlayerActions } from "./use-web-player";

export function PlayableTrackCell(props: TrackCellProps) {
  const { playTrack } = useWebPlayerActions();

  return <TrackCell {...props} onPlay={(track) => void playTrack(track)} />;
}
