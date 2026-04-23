import { SearchIcon } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import { useSearch } from "./search-provider";

export const SpotifySearchButton: FC = () => {
  const { setOpen } = useSearch();
  return (
    <Button
      aria-label="Search Spotify"
      variant="ghost"
      size="icon-sm"
      onClick={() => setOpen((open) => !open)}
    >
      <SearchIcon className="-translate-x-px" />
    </Button>
  );
};
