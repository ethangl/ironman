import { FC, PropsWithChildren, ReactNode, useContext } from "react";

import { WebPlayerActionsContext } from "@/features/spotify/player/use-web-player";
import type { Track } from "@/types";
import { AlbumArt } from "./album-art";
import { PlayButton } from "./play-button";

export type PlaylistCellProps = PropsWithChildren & {
  count?: number;
  disabled?: boolean;
  image?: string | null;
  name: string;
  onPlay?: (tracks: Track[]) => void;
  playable?: boolean;
  subtitle?: ReactNode;
  tracks: Track[];
};

export const PlaylistCell: FC<PlaylistCellProps> = ({
  children,
  count,
  disabled = false,
  image,
  name,
  onPlay,
  playable = true,
  subtitle,
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

  return (
    <>
      {count && (
        <div className="bg-black/25 font-bold flex items-center justify-center rounded-3xl text-xs text-white size-8">
          {count}
        </div>
      )}
      {image ? <AlbumArt src={image} className="size-10" /> : null}
      <div className="space-y-0.5">
        <h3 className="font-medium text-sm truncate">{name}</h3>
        {subtitle && (
          <h5 className="text-muted-foreground text-xs truncate">{subtitle}</h5>
        )}
      </div>
      <div className="flex gap-2 items-center">
        {children}
        {handlePlay && (
          <PlayButton
            size="icon-lg"
            pausable={false}
            disabled={disabled}
            onClick={() => handlePlay(tracks)}
          />
        )}
      </div>
    </>
  );
};
