import { ChevronsUpIcon } from "lucide-react";

import { AlbumArt } from "@/components/album-art";
import { useSidebarState } from "@/components/sidebar";
import { StopButton } from "@/components/stop-button";
import { cn } from "@/lib/utils";
import { NextTrackButton } from "./next-track-button";
import { SkipForwardButton } from "./skip-forward-button";
import { TogglePlayButton } from "./toggle-play-button";
import { useNowPlaying } from "./use-now-playing";

export function MiniPlayer() {
  const [sidebarExpanded] = useSidebarState();
  const {
    displayArtist,
    displayImage,
    displayName,
    hasQueue,
    isRoomMode,
    setExpanded,
  } = useNowPlaying();

  return (
    <div className="backdrop-blur-xl backdrop-invert-10 backdrop-contrast-120 backdrop-saturate-120 bg-linear-to-b from-black/33 to-black/11 flex flex-1 gap-4 items-center m-1 overflow-hidden p-1 rounded-2xl shadow-[inset_0_1px_4px_rgba(0,0,0,0.111),0_1px_2px_rgba(255,255,255,0.222)]">
      <button
        className="group flex flex-auto gap-4 items-center min-w-0 z-1"
        onClick={() => setExpanded(true)}
      >
        <div className="relative z-1">
          <AlbumArt src={displayImage} className="size-12" />
          <div className="absolute backdrop-blur-none group-hover:backdrop-blur-md duration-444 inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-all">
            <ChevronsUpIcon className="absolute inset-0 m-auto size-5 text-white" />
          </div>
        </div>
        <div
          className={cn(
            "min-w-0 mix-blend-plus-lighter space-y-1 text-left transition-opacity truncate z-0",
            !sidebarExpanded && "opacity-100",
          )}
        >
          <h4 className="font-medium leading-tight truncate">{displayName}</h4>
          <p className="text-[11px] leading-tight opacity-50 truncate">
            {displayArtist}
          </p>
        </div>
      </button>
      <nav
        className={cn(
          "flex flex-none items-center transition-opacity z-0",
          !sidebarExpanded && "opacity-0",
        )}
      >
        {isRoomMode ? (
          <>
            <StopButton />
            <SkipForwardButton />
          </>
        ) : (
          <>
            <TogglePlayButton />
            {hasQueue ? <NextTrackButton /> : null}
          </>
        )}
      </nav>
    </div>
  );
}
