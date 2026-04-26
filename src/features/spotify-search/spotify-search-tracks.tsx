import { FC } from "react";

import { AlbumArt } from "@/components/album-art";
import { Square } from "@/components/square";
import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { useOptionalRooms } from "@/features/rooms";
import { PlusIcon } from "lucide-react";
import { useSearch } from "./search-provider";

export const SpotifySearchTracks: FC = () => {
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTrack = rooms?.enqueueTrack;
  const { results, setOpen } = useSearch();

  const canEnqueueToActiveRoom =
    !!activeRoom?.playback.canEnqueue && !!enqueueTrack;

  return (
    <CommandGroup heading="Songs">
      {results.tracks.map((track) => (
        <CommandItem
          disabled={!canEnqueueToActiveRoom}
          key={track.id}
          value={track.id}
          onSelect={() => {
            if (!activeRoom?.playback.canEnqueue || !enqueueTrack) {
              return;
            }

            void enqueueTrack(track, activeRoom.room._id);
            setOpen(false);
          }}
          className="group/searchResult gap-3"
        >
          <AlbumArt src={track.albumImage} className="size-10" />
          <div className="min-w-0 space-y-1">
            <div className="leading-tight truncate">{track.name}</div>
            <div className="truncate text-xs leading-tight text-muted-foreground">
              {track.artist}
            </div>
          </div>
          <CommandShortcut>
            <Square className="bg-foreground/5 opacity-0 group-hover/searchResult:opacity-100">
              <PlusIcon size="12" />
            </Square>
          </CommandShortcut>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};
