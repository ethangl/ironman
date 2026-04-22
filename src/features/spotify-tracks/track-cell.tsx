import { FC, PropsWithChildren, useContext } from "react";

import { AlbumArt } from "@/components/album-art";
import { PlayButton } from "@/components/play-button";
import type { Track } from "@/features/spotify-client/types";
import { WebPlayerActionsContext } from "../spotify-player/use-web-player";
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

export const TrackCell: FC<TrackCellProps> = ({
  children,
  count,
  onPlay,
  playable = true,
  track,
}) => {
  const webPlayerActions = useContext(WebPlayerActionsContext);
  const normalizedTrack = toDisplayTrack(track);
  const handlePlay =
    onPlay ??
    (playable && webPlayerActions
      ? (nextTrack: Track) => {
          void webPlayerActions.playTrack(nextTrack);
        }
      : undefined);

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
      <div className="duration-888 group-hover/list:duration-222 flex gap-2 items-center opacity-0 group-hover/list:opacity-100 transition-opacity">
        {children}
        {handlePlay && (
          <PlayButton
            size="icon-lg"
            pausable={false}
            onClick={() => handlePlay(normalizedTrack)}
          />
        )}
      </div>
    </>
  );
};
