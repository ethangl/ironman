"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSearch } from "./search-provider";

export function SearchInput() {
  const { query, setQuery, loading } = useSearch();

  return (
    <div className="relative">
      <div className="absolute flex items-center inset-4 justify-center m-auto pointer-events-none right-auto text-muted-foreground size-4">
        {loading ? <Spinner /> : <SearchIcon className="size-4" />}
      </div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a song to lock in..."
        className="h-12 pl-10.5 text-lg! w-full"
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
