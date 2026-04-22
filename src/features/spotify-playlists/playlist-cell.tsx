import { FC, PropsWithChildren, ReactNode, useContext } from "react";

import { AlbumArt } from "@/components/album-art";
import { PlayButton } from "@/components/play-button";
import type { Track } from "@/features/spotify-client/types";
import { WebPlayerActionsContext } from "../spotify-player/use-web-player";

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
      <div className="flex gap-2 items-center">
        {count && (
          <div className="bg-black/25 font-bold flex items-center justify-center rounded-3xl text-xs size-8">
            {count}
          </div>
        )}
        {image ? <AlbumArt src={image} className="size-10" /> : null}
      </div>
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
