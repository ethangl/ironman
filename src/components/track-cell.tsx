import { FC } from "react";

import { useWebPlayer } from "@/hooks/use-web-player";
import { toPlayable, TrackInfo } from "@/types";
import { AlbumArt } from "./album-art";
import { PlayButton } from "./play-button";

export type TrackCellProps = {
  count?: number;
  track: TrackInfo;
};

export const TrackCell: FC<TrackCellProps> = ({ count, track }) => {
  const { playTrack } = useWebPlayer();

  return (
    <>
      {count && (
        <div className="bg-accent/25 font-bold flex items-center justify-center rounded-3xl text-xs text-muted-foreground size-8">
          {count}
        </div>
      )}
      {track.trackImage && (
        <AlbumArt src={track.trackImage} className="size-10" />
      )}
      <div className="space-y-0.5">
        <h3 className="font-medium text-sm truncate">{track.trackName}</h3>
        <h5 className="text-muted-foreground text-xs truncate">
          {track.trackArtist}
        </h5>
      </div>
      <PlayButton
        size="icon-lg"
        pausable={false}
        onClick={() => playTrack(toPlayable(track))}
      />
    </>
  );
};
