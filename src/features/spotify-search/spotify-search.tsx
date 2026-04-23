import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { useWebPlayerActions } from "@/features/spotify-player";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "./search-provider";

export function SpotifySearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { playTrack } = useWebPlayerActions();
  const { error, loading, query, results, setQuery } = useSearch();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const trimmedQuery = query.trim();

  const hasResults = results.tracks.length > 0 || results.artists.length > 0;

  return (
    <>
      <Button
        aria-label="Search Spotify"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
      >
        <SearchIcon />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search Spotify for songs or artists..."
          />
          <CommandList className="max-h-[60vh]">
            {loading && (
              <CommandGroup heading="Searching">
                <CommandItem disabled>
                  <Spinner />
                  Searching Spotify...
                </CommandItem>
              </CommandGroup>
            )}

            {error && (
              <CommandGroup heading="Error">
                <CommandItem disabled>{error}</CommandItem>
              </CommandGroup>
            )}

            {!loading && !error && hasResults && (
              <>
                {results.tracks.length > 0 && (
                  <CommandGroup heading="Songs">
                    {results.tracks.map((track) => (
                      <CommandItem
                        key={track.id}
                        value={`${track.name} ${track.artist}`}
                        onSelect={() => {
                          void playTrack(track);
                          setOpen(false);
                        }}
                      >
                        <div className="min-w-0">
                          <p className="truncate">{track.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {track.artist}
                          </p>
                        </div>
                        <CommandShortcut>Play</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.artists.length > 0 && (
                  <CommandGroup heading="Artists">
                    {results.artists.map((artist) => (
                      <CommandItem
                        key={artist.id}
                        value={artist.id}
                        keywords={[artist.name]}
                        onSelect={() => {
                          navigate(`/artist/${artist.id}`);
                          setOpen(false);
                        }}
                      >
                        <p className="truncate">{artist.name}</p>
                        <CommandShortcut>Open</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!loading && !hasResults && (
                  <CommandEmpty>No results for "${trimmedQuery}"</CommandEmpty>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
