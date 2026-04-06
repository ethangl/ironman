"use client";

import { SearchInput } from "@/components/search/search-input";
import { SearchProvider } from "@/components/search/search-provider";
import { SearchResults } from "@/components/search/search-results";
import { useIronman } from "@/hooks/use-ironman";
import { IronmanPanel } from "./ironman-panel";

export function DashboardContent() {
  const { streak, loading } = useIronman();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mist-500 border-t-white" />
      </div>
    );
  }

  return (
    <>
      <SearchProvider>
        <SearchInput />
        <SearchResults />
      </SearchProvider>
      {streak?.active && <IronmanPanel streak={streak} />}
    </>
  );
}
