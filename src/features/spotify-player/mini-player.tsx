import { ChevronsUpIcon } from "lucide-react";

import { AlbumArt } from "@/components/album-art";
import { PlayButton } from "@/components/play-button";
import { NextTrackButton } from "./next-track-button";
import { PlayerWrapper } from "./player-wrapper";
import { RepairSyncButton } from "./repair-sync-button";
import { SkipForwardButton } from "./skip-forward-button";
import { TogglePlayButton } from "./toggle-play-button";
import { useNowPlaying } from "./use-now-playing";

export function MiniPlayer() {
  const nowPlaying = useNowPlaying();
  const roomPlayback = nowPlaying.roomPlayback;

  return (
    <PlayerWrapper className="p-0.5" toggled={!nowPlaying.expanded}>
      <div className="flex gap-2.5 h-12 items-center px-2.5">
        <button
          className="group flex flex-auto gap-2.5 items-center min-w-0"
          onClick={() => nowPlaying.setExpanded(true)}
        >
          <div className="relative size-8">
            <AlbumArt src={nowPlaying.displayImage} />
            <div className="absolute backdrop-blur-none group-hover:backdrop-blur-md duration-444 inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-all">
              <ChevronsUpIcon className="absolute inset-0 m-auto size-5 text-white" />
            </div>
          </div>
          <div className="min-w-0 mix-blend-plus-lighter space-y-1.5 text-left truncate">
            <h6 className="leading-none text-xs truncate">
              {nowPlaying.displayName}
            </h6>
            <p className="font-medium text-[9px] leading-none opacity-50 truncate">
              {nowPlaying.compactDisplayArtist}
            </p>
          </div>
        </button>
        <nav className="flex flex-none items-center gap-1 mix-blend-plus-lighter">
          <RepairSyncButton />
          {nowPlaying.isRoomMode ? (
            <>
              <PlayButton
                variant="overlay"
                size="icon"
                disabled={!roomPlayback?.canToggleListening}
                playing={
                  roomPlayback?.canToggleListening && !roomPlayback.paused
                }
                onClick={() => roomPlayback?.toggleListening()}
              />
              <SkipForwardButton />
            </>
          ) : (
            <>
              <TogglePlayButton />
              {nowPlaying.hasQueue ? <NextTrackButton /> : null}
            </>
          )}
        </nav>
      </div>
    </PlayerWrapper>
  );
}
