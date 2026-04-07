import { ComponentProps, FC } from "react";

import { AlbumArt } from "@/components/player/album-art";
import { PlayButton } from "@/components/player/play-button";

type ThumbnailProps = ComponentProps<"div"> & {
  description: string;
  name: string;
  onPlay?: () => void;
  src: string | null;
};

export const Thumbnail: FC<ThumbnailProps> = ({
  name,
  description,
  onPlay,
  src,
  ...props
}) => {
  return (
    <div
      className="group bg-accent/15 flex-none p-3 rounded-xl select-none"
      {...props}
    >
      <div className="relative">
        <AlbumArt src={src} className="size-32" />
        <PlayButton
          size="icon-xl"
          pausable={false}
          className="absolute bg-black/50 hover:bg-black/75 inset-0 m-auto opacity-0 group-hover:opacity-100 transition-all"
          {...(onPlay ? { onClick: onPlay } : {})}
        />
      </div>
      <div className="flex gap-2 items-center mt-2 max-w-32">
        <div className="min-w-0 space-y-px truncate">
          <h3 className="text-xs truncate">{name}</h3>
          <h5 className="text-muted-foreground text-[10px] truncate">
            {description}
          </h5>
        </div>
      </div>
    </div>
  );
};
