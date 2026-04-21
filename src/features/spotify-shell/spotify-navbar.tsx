import { LibraryIcon, PanelLeftCloseIcon } from "lucide-react";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/features/spotify-search";
import { useSpotifyActivityUi } from "./use-spotify-activity-ui";

export function SpotifyNavbar() {
  const { isExpanded, setIsExpanded } = useSpotifyActivityUi();
  return (
    <Section className="flex flex-none gap-2 h-16 items-center pl-0 pr-4">
      <SearchInput />
      <Button
        variant="ghost"
        size="icon-sm"
        className="ml-auto"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        {isExpanded ? <PanelLeftCloseIcon /> : <LibraryIcon />}
      </Button>
    </Section>
  );
}
