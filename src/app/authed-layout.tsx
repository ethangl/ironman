import { Outlet } from "react-router-dom";

import { BackgroundOverlay } from "@/components/background-overlay";
import { Section } from "@/components/section";
import { RoomsNavbar } from "@/features/rooms/ui/rooms-navbar";
import { RoomsSurface } from "@/features/rooms/ui/rooms-surface";
import { SearchResults } from "@/features/spotify-search";
import {
  SpotifyFooter,
  SpotifyNavbar,
  useSpotifyActivityUi,
} from "@/features/spotify-shell";
import { cn } from "@/lib/utils";

export function AuthedLayout() {
  const { isExpanded } = useSpotifyActivityUi();
  return (
    <div
      className={cn(
        "absolute gap-3 grid grid-cols-[calc(--spacing(112))_1fr] inset-0 items-stretch py-3",
        isExpanded ? "left-0" : "-left-96",
      )}
    >
      <aside className="flex flex-col gap-px max-h-full overflow-hidden relative rounded-r-3xl text-emerald-300">
        <BackgroundOverlay className="dark:bg-emerald-400/50 backdrop-brightness-600 backdrop-contrast-600 mix-blend-exclusion" />
        <SpotifyNavbar />
        {isExpanded ? (
          <div className="flex-auto overflow-y-auto scrollbar-none space-y-px transition-opacity">
            <SearchResults />
            <Outlet />
          </div>
        ) : (
          <Section className="flex-auto" />
        )}
        <SpotifyFooter />
      </aside>
      <main className="flex flex-col gap-px max-h-full overflow-hidden relative rounded-l-3xl text-red-300">
        <BackgroundOverlay className="dark:bg-red-400/50 backdrop-brightness-600 backdrop-contrast-600 mix-blend-exclusion" />
        <RoomsNavbar />
        <div className="flex-auto overflow-y-auto scrollbar-none space-y-px">
          <RoomsSurface />
        </div>
      </main>
    </div>
  );
}
