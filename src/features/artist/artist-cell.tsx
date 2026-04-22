import { FC } from "react";

import { AlbumArt } from "@/components/album-art";
import type { SpotifyArtist } from "@/features/spotify-client/types";
import { ArrowRightIcon } from "lucide-react";

export type ArtistCellProps = {
  count?: number;
  artist: SpotifyArtist;
};

export const ArtistCell: FC<ArtistCellProps> = ({ count, artist }) => {
  return (
    <>
      <div className="flex gap-3 items-center">
        {count && (
          <div className="bg-black/25 font-bold flex items-center justify-center rounded-3xl text-xs text-white size-8">
            {count}
          </div>
        )}
        <AlbumArt src={artist.image} className="size-10" />
      </div>
      <h3 className="font-medium text-lg truncate">{artist.name}</h3>
      <div className="duration-888 group-hover/list:duration-222 flex items-center justify-center opacity-0 group-hover/list:opacity-100 size-10 transition-opacity">
        <ArrowRightIcon />
      </div>
    </>
  );
};
