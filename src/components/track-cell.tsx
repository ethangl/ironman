import { FC, PropsWithChildren } from "react";

import { Track, TrackLike, toTrack } from "@/types";
import { AlbumArt } from "./album-art";
import { PlayButton } from "./play-button";

export type TrackCellProps = PropsWithChildren & {
  count?: number;
  onPlay?: (track: Track) => void;
  track: TrackLike;
};

export const TrackCell: FC<TrackCellProps> = ({
  children,
  count,
  onPlay,
  track,
}) => {
  const normalizedTrack = toTrack(track);

  return (
    <>
      {count && (
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
      <div className="flex gap-2 items-center">
        {children}
        {onPlay ? (
          <PlayButton
            size="icon-lg"
            pausable={false}
            onClick={() => onPlay(normalizedTrack)}
          />
        ) : null}
      </div>
    </>
  );
};
