import { FC, PropsWithChildren } from "react";

import type { Track, TrackSnapshot } from "@/types";
import { AlbumArt } from "./album-art";
import { PlayButton } from "./play-button";

function isTrackSnapshot(track: Track | TrackSnapshot): track is TrackSnapshot {
  return "trackId" in track;
}

function toDisplayTrack(track: Track | TrackSnapshot): Track {
  if (!isTrackSnapshot(track)) {
    return track;
  }

  return {
    id: track.trackId,
    name: track.trackName,
    artist: track.trackArtist,
    albumImage: track.trackImage,
    durationMs: track.trackDuration,
  };
}

export type TrackCellProps = PropsWithChildren & {
  count?: number;
  onPlay?: (track: Track) => void;
  track: Track | TrackSnapshot;
};

export const TrackCell: FC<TrackCellProps> = ({
  children,
  count,
  onPlay,
  track,
}) => {
  const normalizedTrack = toDisplayTrack(track);

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
