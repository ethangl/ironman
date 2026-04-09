import { FC } from "react";

import { useWebPlayer } from "@/hooks/use-web-player";
import { TrackLike, toTrack } from "@/types";
import { AlbumArt } from "./album-art";
import { PlayButton } from "./play-button";

export type TrackCellProps = {
  count?: number;
  track: TrackLike;
};

export const TrackCell: FC<TrackCellProps> = ({ count, track }) => {
  const { playTrack } = useWebPlayer();
  const normalizedTrack = toTrack(track);

  return (
    <>
      {count !== undefined && (
        <div className="bg-accent/25 font-bold flex items-center justify-center rounded-3xl text-xs text-muted-foreground size-8">
          {count}
        </div>
      )}
      {normalizedTrack.albumImage && (
        <AlbumArt src={normalizedTrack.albumImage} className="size-10" />
      )}
      <div className="space-y-0.5">
        <h3 className="font-medium text-sm truncate">{normalizedTrack.name}</h3>
        <h5 className="text-muted-foreground text-xs truncate">
          {normalizedTrack.artist}
        </h5>
      </div>
      <PlayButton
        size="icon-lg"
        pausable={false}
        onClick={() => playTrack(normalizedTrack)}
      />
    </>
  );
};
