import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AlbumArt } from "@/components/album-art";
import { Square } from "@/components/square";
import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { ArrowRightIcon } from "lucide-react";
import { useSearch } from "./search-provider";

export const SpotifySearchArtists: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { results, setOpen } = useSearch();

  return (
    <CommandGroup heading="Artists">
      {results.artists.map((artist) => (
        <CommandItem
          key={artist.id}
          value={artist.id}
          keywords={[artist.name]}
          onSelect={() => {
            navigate({
              pathname: `/artist/${artist.id}`,
              search: location.search,
            });
            setOpen(false);
          }}
          className="group/searchResult gap-3"
        >
          <AlbumArt src={artist.image} className="size-8" />
          <p className="text-lg truncate">{artist.name}</p>
          <CommandShortcut>
            <Square className="bg-foreground/5 opacity-0 group-hover/searchResult:opacity-100 size-8">
              <ArrowRightIcon size="12" />
            </Square>
          </CommandShortcut>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};
