"use client";

import {
  ChevronDownIcon,
  LockIcon,
  LockOpenIcon,
  PauseIcon,
  PlayIcon,
  SkullIcon,
  Volume2Icon,
  VolumeIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useWebPlayer } from "../../hooks/use-web-player";
import { PlayerWrapper } from "./player-wrapper";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function NowPlayingBar() {
  const {
    currentTrack,
    streak,
    count,
    paused,
    progressMs,
    durationMs,
    volume,
    sdkState,
    togglePlay,
    lockIn,
    surrender,
    setVolume,
  } = useWebPlayer();

  const [expanded, setExpanded] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);

  const artworkUrl = streak?.trackImage ?? currentTrack?.albumImage ?? null;

  // Extract palette from track artwork
  useEffect(() => {
    if (!artworkUrl) return;
    let cancelled = false;
    fetch(`/api/palette?url=${encodeURIComponent(artworkUrl)}`)
      .then((r) => r.json())
      .then((colors: string[]) => {
        if (cancelled) return;
        setPalette(colors);
        const root = document.documentElement;
        colors.forEach((c, i) => root.style.setProperty(`--palette-${i}`, c));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      const root = document.documentElement;
      for (let i = 0; i < 5; i++) root.style.removeProperty(`--palette-${i}`);
    };
  }, [artworkUrl]);

  const trackId = streak?.trackId ?? currentTrack?.id ?? null;
  const sdkActive = !!(sdkState && trackId && sdkState.trackId === trackId);
  const displayProgress = sdkActive ? sdkState!.position : progressMs;
  const displayDuration = sdkActive ? sdkState!.duration : durationMs;
  const pct =
    displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;

  const isPlaying = !!(currentTrack || streak?.active);
  if (!isPlaying) return null;

  const displayName = streak?.trackName ?? currentTrack?.name ?? "";
  const displayArtist = streak?.trackArtist ?? currentTrack?.artist ?? "";
  const displayImage = streak?.trackImage ?? currentTrack?.albumImage ?? null;
  const displayTrackId = streak?.trackId ?? currentTrack?.id ?? "";

  return (
    <>
      <PlayerWrapper
        className="max-w-sm p-0.5"
        shaderProps={{
          colorA: palette[0],
          colorB: palette[2],
          detail: 0.5,
          speed: 0.5,
        }}
        toggled={!expanded}
      >
        <div
          className="absolute bg-palette-3/50 duration-300 inset-0 left-1 bottom-0 right-auto top-auto rounded-3xl transition-[width]"
          style={{ width: `${pct}%` }}
        />

        <div className="flex items-center gap-2.5 p-2.5 rounded-3xl">
          <Link
            href={`/song/${displayTrackId}`}
            className="bg-palette-2 flex font-bold items-center justify-center overflow-hidden relative rounded-2xl shadow-md shadow-black/25 size-8 text-palette-4"
          >
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt=""
                className="absolute object-cover"
              />
            ) : (
              "?"
            )}
          </Link>

          <button
            className="flex-auto isolate min-w-0 text-left space-y-1.5"
            onClick={() => setExpanded(true)}
          >
            <h6 className="leading-none text-xs truncate">{displayName}</h6>
            <p className="font-medium text-[9px] leading-none opacity-50 truncate">
              {displayArtist}
            </p>
          </button>

          <div className="flex flex-none items-center gap-1 mix-blend-plus-lighter">
            {streak?.active ? (
              <Button
                variant="secondary"
                size="sm"
                className="group bg-white/10 hover:bg-white/5 gap-2"
                onClick={surrender}
              >
                <LockIcon className="group-hover:hidden size-3" />
                <LockOpenIcon className="hidden group-hover:block size-3" />
                <span className="font-bold text-sm tracking-tighter">
                  <span className="tabular-nums">{count}</span>
                  <span className="ml-px opacity-50">x</span>
                </span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="icon-sm"
                className="group bg-white/10 hover:bg-white/5 "
                onClick={() => lockIn()}
              >
                <LockOpenIcon className="group-hover:hidden size-4" />
                <LockIcon className="hidden group-hover:block size-4" />
              </Button>
            )}

            <Button
              size="icon-sm"
              onClick={togglePlay}
              className="bg-white/10 hover:bg-white/5"
            >
              {paused ? (
                <PlayIcon fill="currentColor" />
              ) : (
                <PauseIcon fill="currentColor" />
              )}
            </Button>
          </div>
        </div>
      </PlayerWrapper>

      <PlayerWrapper
        shaderProps={{
          colorA: palette[0],
          colorB: palette[2],
          detail: 1,
          speed: 0.25,
        }}
        toggled={expanded}
      >
        <div className="p-6 pb-4 rounded-3xl">
          <Link
            href={`/song/${displayTrackId}`}
            className="bg-palette-2 flex font-bold items-center justify-center mb-8 mx-auto overflow-hidden relative rounded-2xl shadow-lg shadow-black/25 size-98 text-palette-4 text-9xl"
          >
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt=""
                className="absolute object-cover"
              />
            ) : (
              "?"
            )}
          </Link>

          <header className="mb-5 mix-blend-plus-darker dark:mix-blend-plus-lighter space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-auto isolate min-w-0 space-y-0.5">
                <h2 className="text-lg truncate">{displayName}</h2>
                <h5 className="font-medium opacity-33 text-sm truncate">
                  {displayArtist}
                </h5>
              </div>
              {streak?.active && (
                <div className="bg-black/5 dark:bg-white/5 inline-flex flex-none font-bold items-center mt-0.5 px-[0.5em] relative rounded-2xl text-center tracking-tighter">
                  <span className="tabular-nums">{count}</span>
                  <span className="ml-px opacity-25">x</span>
                </div>
              )}
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

          <nav className="flex gap-4 items-center justify-center mb-10 mix-blend-plus-darker dark:mix-blend-plus-lighter">
            {streak?.active ? (
              <>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="bg-white/10 hover:bg-white/5"
                  onClick={surrender}
                >
                  <SkullIcon />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-2xl"
                  className="bg-white/10 hover:bg-white/5"
                  onClick={togglePlay}
                >
                  {paused ? (
                    <PlayIcon fill="currentColor" />
                  ) : (
                    <PauseIcon fill="currentColor" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="bg-white/10 hover:bg-white/5"
                  onClick={surrender}
                >
                  <SkullIcon />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="icon-2xl"
                  className="bg-white/10 hover:bg-white/5"
                  onClick={togglePlay}
                >
                  {paused ? (
                    <PlayIcon fill="currentColor" />
                  ) : (
                    <PauseIcon fill="currentColor" />
                  )}
                </Button>
              </>
            )}
          </nav>

          {!streak?.active && (
            <div className="flex gap-3 items-center justify-center mb-10 mix-blend-plus-darker dark:mix-blend-plus-lighter">
              <button
                onClick={() => lockIn(false)}
                className="flex gap-2 items-center rounded-xl bg-white/10 hover:bg-white/5 px-4 py-2 text-sm font-bold uppercase tracking-wider transition"
              >
                <LockIcon className="size-3.5" />
                Lock In
              </button>
              <button
                onClick={() => lockIn(true)}
                className="flex gap-2 items-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm font-bold uppercase tracking-wider transition"
              >
                <SkullIcon className="size-3.5" />
                Hardcore
              </button>
            </div>
          )}

          <div className="flex gap-3 items-center isolate mb-4 mix-blend-plus-darker dark:mix-blend-plus-lighter">
            <VolumeIcon className="size-4" />
            <Slider
              min={0}
              max={100}
              value={volume}
              onValueChange={(e) => setVolume(Number(e))}
              className="flex-auto"
            />
            <Volume2Icon className="size-4" />
          </div>

          <footer className="flex gap-6 items-center justify-center mix-blend-overlay">
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center justify-center mx-auto size-8"
            >
              <ChevronDownIcon />
            </button>
          </footer>
        </div>
      </PlayerWrapper>
    </>
  );
}
