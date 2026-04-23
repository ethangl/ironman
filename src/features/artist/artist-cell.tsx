import { ArrowRightIcon } from "lucide-react";
import { FC } from "react";

import { AlbumArt } from "@/components/album-art";
import { ListItemAction, ListLink } from "@/components/list";
import { Square } from "@/components/square";
import type { SpotifyArtist } from "@/features/spotify-client/types";

export type ArtistCellProps = {
  artist: SpotifyArtist;
  count?: number;
  href: string;
};

export const ArtistCell: FC<ArtistCellProps> = ({ artist, count, href }) => (
  <ListLink href={href}>
    <div className="flex gap-3 items-center">
      {count && (
        <div className="bg-black/25 font-bold flex items-center justify-center rounded-3xl text-xs text-white size-8">
          {count}
        </div>
      )}
      <AlbumArt src={artist.image} className="size-10" />
    </div>
    <h3 className="font-medium text-lg truncate">{artist.name}</h3>
    <ListItemAction>
      <Square>
        <ArrowRightIcon />
      </Square>
    </ListItemAction>
  </ListLink>
);
