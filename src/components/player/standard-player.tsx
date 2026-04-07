"use client";

import { ChevronsDownIcon, Volume2Icon, VolumeIcon } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";
import { AlbumArt } from "./album-art";
import { HardcoreButton } from "./hardcore-button";
import { LockInButton } from "./lock-in-button";
import { NextTrackButton } from "./next-track-button";
import { PlayButton } from "./play-button";
import { PlayerWrapper } from "./player-wrapper";
import { PrevTrackButton } from "./prev-track-button";
import { ShareButton } from "./share-button";
import { ShuffleButton } from "./shuffle-button";
import { useNowPlaying } from "./use-now-playing";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function StandardPlayer() {
  const {
    displayArtist,
    displayDuration,
    displayImage,
    displayName,
    displayProgress,
    displayTrackId,
    expanded,
    hasQueue,
    palette,
    pct,
    shuffled,
    streak,
    volume,
    setExpanded,
    setVolume,
    toggleShuffle,
  } = useNowPlaying();

  return (
    <PlayerWrapper
      shaderProps={{
        colorA: palette[0],
        colorB: palette[2],
        detail: 1,
        speed: 0.25,
      }}
      toggled={expanded}
      fullScreen={!!streak?.hardcore}
    >
      <div className="max-w-md mx-auto p-6 pb-4 rounded-3xl">
        <AlbumArt src={displayImage} className="my-12 mx-auto size-72" />
        <header className="mb-5 mix-blend-plus-darker dark:mix-blend-plus-lighter space-y-6">
          <div className="flex gap-6 items-start">
            <div className="flex-auto isolate min-w-0 space-y-0.5">
              <h2 className="text-lg truncate">{displayName}</h2>
              <h5 className="font-medium opacity-33 text-sm truncate">
                {displayArtist}
              </h5>
            </div>
            <div className="flex gap-1 items-center">
              <LockInButton />
              <HardcoreButton />
            </div>
          </div>
          <div className="space-y-2 ">
            <div className="h-1 relative">
              <div className="absolute bg-black dark:bg-white inset-0 opacity-10 rounded" />
              <div
                className="h-full bg-black dark:bg-white duration-300 min-w-1 rounded transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex font-medium items-center justify-between opacity-33 tabular-nums text-[11px]">
              <span>{formatTime(displayProgress)}</span>
              <span>{formatTime(displayDuration)}</span>
            </div>
          </div>
        </header>

        <nav className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-10 mix-blend-plus-darker dark:mix-blend-plus-lighter">
          <div className="flex flex-auto gap-4 items-center justify-end">
            {hasQueue && (
              <>
                <ShuffleButton />
                <PrevTrackButton />
              </>
            )}
          </div>
          <PlayButton size="icon-2xl" />
          <div className="flex flex-auto gap-4 items-center justify-start">
            {hasQueue && <NextTrackButton />}
          </div>
        </nav>

        <div className="flex gap-2 items-center mb-2 -mx-3">
          <Button variant="overlay" size="icon">
            <VolumeIcon className="translate-x-1" />
          </Button>
          <Slider
            min={0}
            max={100}
            value={volume}
            onValueChange={(e) => setVolume(Number(e))}
            className="flex-auto "
          />
          <Button variant="overlay" size="icon">
            <Volume2Icon className="translate-x-px" />
          </Button>
        </div>

        <footer className="flex gap-6 items-center justify-center -mx-3">
          <div className="flex flex-auto gap-4 items-center justify-start">
            <ShareButton
              trackId={displayTrackId}
              trackArtist={displayArtist}
              trackName={displayName}
              count={streak?.count || 0}
              isIronMan={streak?.active || false}
            />
          </div>
          <Button
            variant="overlay"
            size="icon-xl"
            onClick={() => setExpanded(false)}
          >
            <ChevronsDownIcon />
          </Button>
          <div className="flex flex-auto gap-4 items-center justify-end">
            <ShareButton
              trackId={displayTrackId}
              trackArtist={displayArtist}
              trackName={displayName}
              count={streak?.count || 0}
              isIronMan={streak?.active || false}
            />
          </div>
        </footer>
      </div>
    </PlayerWrapper>
  );
}
