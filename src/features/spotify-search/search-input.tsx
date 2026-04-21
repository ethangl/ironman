import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useSearch } from "./search-provider";

export function SearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const { query, setQuery, loading } = useSearch();

  const expanded = isFocused || query;

  return (
    <div
      className={cn(
        "absolute ease-elastic flex h-full left-0 items-center justify-center transition-all z-7",
        expanded ? "duration-1000 w-full" : "duration-444 w-16",
      )}
    >
      <div className="absolute flex items-center left-6 justify-center m-auto pointer-events-none text-white size-4 top-6">
        {loading ? <Spinner /> : <SearchIcon className="size-4" />}
      </div>
      <Input
        name="search"
        type="text"
        value={query}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onValueChange={(v) => setQuery(v)}
        placeholder="Search Spotify for songs, artists, or playlists..."
        className={cn(
          "duration-444 ease-elastic h-12 mx-2 text-lg! transition-all w-full",
          expanded
            ? "cursor-auto border-emerald-400! ring-emerald-400/20! bg-muted pl-12 placeholder:opacity-100"
            : "bg-transparent hover:bg-muted cursor-pointer placeholder:opacity-0",
        )}
      />
      {query && (
        <button
          className="absolute bg-background/25 flex right-5 items-center justify-center m-auto size-6 rounded-full text-muted-foreground top-5"
          onClick={() => setQuery("")}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
