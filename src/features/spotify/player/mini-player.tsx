import { ChevronsUpIcon } from "lucide-react";

import { AlbumArt } from "@/components/album-art";
import { NextTrackButton } from "./next-track-button";
import { PlayerWrapper } from "./player-wrapper";
import { TogglePlayButton } from "./toggle-play-button";
import { useNowPlaying } from "./use-now-playing";

export function MiniPlayer() {
  const {
    expanded,
    displayArtist,
    displayImage,
    displayName,
    hasQueue,
    palette,
    setExpanded,
  } = useNowPlaying();

  return (
    <PlayerWrapper
      className="p-0.5"
      shaderProps={{
        colorA: palette[0],
        colorB: palette[2],
        detail: 0.5,
        speed: 0.5,
      }}
      toggled={!expanded}
    >
      <div className="flex gap-2.5 items-center p-2.5">
        <button
          className="group flex flex-auto gap-2.5 items-center min-w-0"
          onClick={() => setExpanded(true)}
        >
          <div className="relative size-8">
            <AlbumArt src={displayImage} />
            <div className="absolute backdrop-blur-none group-hover:backdrop-blur-md duration-444 inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-all">
              <ChevronsUpIcon className="absolute inset-0 m-auto size-5 text-white" />
            </div>
          </div>
          <div className="min-w-0 mix-blend-plus-lighter space-y-1.5 text-left truncate">
            <h6 className="leading-none text-xs truncate">{displayName}</h6>
            <p className="font-medium text-[9px] leading-none opacity-50 truncate">
              {displayArtist}
            </p>
          </div>
        </button>
        <nav className="flex flex-none items-center gap-1 mix-blend-plus-lighter">
          <TogglePlayButton />
          {hasQueue && <NextTrackButton />}
        </nav>
      </div>
    </PlayerWrapper>
  );
}
