import { ChevronsUpIcon, SkipForwardIcon } from "lucide-react";

import { AlbumArt } from "@/components/album-art";
import { StopButton } from "@/components/stop-button";
import { Button } from "@/components/ui/button";
import { NextTrackButton } from "./next-track-button";
import { TogglePlayButton } from "./toggle-play-button";
import { useNowPlaying } from "./use-now-playing";

export function MiniPlayer() {
  const nowPlaying = useNowPlaying();
  const roomPlayback = nowPlaying.roomPlayback;

  return (
    <div className="backdrop-blur-xl backdrop-invert-10 backdrop-contrast-120 backdrop-saturate-120 bg-linear-to-b from-black/33 to-black/11 flex flex-1 gap-4 items-center m-1 p-1 rounded-2xl shadow-[inset_0_1px_4px_rgba(0,0,0,0.111),0_1px_2px_rgba(255,255,255,0.222)]">
      <button
        className="group flex flex-auto gap-2.5 items-center min-w-0"
        onClick={() => nowPlaying.setExpanded(true)}
      >
        <div className="relative">
          <AlbumArt src={nowPlaying.displayImage} className="size-12" />
          <div className="absolute backdrop-blur-none group-hover:backdrop-blur-md duration-444 inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-all">
            <ChevronsUpIcon className="absolute inset-0 m-auto size-5 text-white" />
          </div>
        </div>
        <div className="min-w-0 mix-blend-plus-lighter space-y-0.5 text-left truncate">
          <h4 className="font-medium leading-tight truncate">
            {nowPlaying.displayName}
          </h4>
          <p className="text-[11px] leading-tight opacity-50 truncate">
            {nowPlaying.displayArtist}
          </p>
        </div>
      </button>
      <nav className="flex flex-none items-center">
        {nowPlaying.isRoomMode ? (
          <>
            <StopButton
              variant="overlay"
              size="icon-lg"
              disabled={!roomPlayback?.canToggleListening}
              playing={roomPlayback?.canToggleListening && !roomPlayback.paused}
              onClick={() => roomPlayback?.toggleListening()}
            />
            {roomPlayback?.canSkip && (
              <Button
                variant="overlay"
                size="icon-lg"
                disabled={!roomPlayback.hasTrack}
                onClick={() => roomPlayback.skip()}
              >
                <SkipForwardIcon />
              </Button>
            )}
          </>
        ) : (
          <>
            <TogglePlayButton />
            {nowPlaying.hasQueue ? <NextTrackButton /> : null}
          </>
        )}
      </nav>
    </div>
  );
}
