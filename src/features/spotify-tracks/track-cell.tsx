import { FC, PropsWithChildren } from "react";

import { AlbumArt } from "@/components/album-art";
import { ListItemAction } from "@/components/list";
import type { Track } from "@/features/spotify-client/types";
import type { TrackSnapshot } from "./types";

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
  playable?: boolean;
  track: Track | TrackSnapshot;
};

export const TrackCell: FC<TrackCellProps> = ({ children, count, track }) => {
  const normalizedTrack = toDisplayTrack(track);
  return (
    <>
      <div className="flex gap-3 items-center">
        {count && (
          <div className="bg-black/25 font-bold flex items-center justify-center rounded-3xl text-xs size-8">
            {count}
          </div>
        )}
        {normalizedTrack.albumImage && (
          <AlbumArt src={normalizedTrack.albumImage} className="size-10" />
        )}
      </div>
      <div className="space-y-0.5">
        <h3 className="font-medium text-sm truncate">{normalizedTrack.name}</h3>
        <h5 className="text-muted-foreground text-xs truncate">
          {normalizedTrack.artist}
        </h5>
      </div>
      <ListItemAction>{children}</ListItemAction>
    </>
  );
};
