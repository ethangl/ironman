import { useEffect } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { useSearch } from "./search-provider";
import { SearchArtists } from "./search-artists";
import { SearchTracks } from "./search-tracks";

export function Search() {
  const { error, loading, open, query, results, setOpen, setQuery } =
    useSearch();

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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search Apple Music for songs..."
        />
        <CommandList className="max-h-[60vh]">
          {loading && (
            <CommandGroup>
              <CommandItem disabled>
                <Spinner />
                Searching Apple Music...
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
              {results.tracks.length > 0 && <SearchTracks />}
              {results.artists.length > 0 && <SearchArtists />}
            </>
          )}

          {!loading && !error && !hasResults && trimmedQuery.length > 0 && (
            <CommandEmpty>No results for "{trimmedQuery}"</CommandEmpty>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
