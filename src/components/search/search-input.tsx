"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSearch } from "./search-provider";

export function SearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const { query, setQuery, loading } = useSearch();

  const expanded = isFocused || query;

  return (
    <div
      className={cn(
        "absolute duration-1000 ease-elastic flex h-full inset-0 items-center justify-center mx-auto transition-all",
        expanded ? "w-md" : "w-12",
      )}
    >
      <div className="absolute flex items-center inset-4 justify-center m-auto pointer-events-none right-auto text-muted-foreground size-4">
        {loading ? <Spinner /> : <SearchIcon className="size-4" />}
      </div>
      <Input
        name="search"
        type="text"
        value={query}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onValueChange={(v) => setQuery(v)}
        placeholder="Search songs, artists, or playlists..."
        className={cn(
          "bg-transparent duration-333 ease-out h-12 pl-10.5 text-lg! transition-all w-full",
          expanded
            ? "cursor-auto bg-input/50 placeholder:opacity-100"
            : "bg-transparent hover:bg-input/25 cursor-pointer placeholder:opacity-0",
        )}
      />
      {query && (
        <button
          className="absolute flex inset-4 items-center justify-center m-auto size-4 text-muted-foreground left-auto"
          onClick={() => setQuery("")}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
