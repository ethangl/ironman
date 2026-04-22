import {
  ChevronsDownIcon,
  PauseIcon,
  PlayIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AlbumArt } from "@/components/album-art";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  formatRoomSyncLabel,
  toRoomTrack,
  useOptionalRooms,
} from "@/features/rooms";
import { RoomPlayerPanel } from "@/features/rooms/ui/room-player-panel";
import { RoomStatusBadge } from "@/features/rooms/ui/room-status-badge";
import { AlbumButton } from "./album-button";
import { NextTrackButton } from "./next-track-button";
import { PlayerWrapper } from "./player-wrapper";
import { PrevTrackButton } from "./prev-track-button";
import { QueueButton } from "./queue-button";
import { RepeatButton } from "./repeat-button";
import { ShuffleButton } from "./shuffle-button";
import { TogglePlayButton } from "./toggle-play-button";
import { useNowPlaying } from "./use-now-playing";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function StandardPlayer() {
  const nowPlaying = useNowPlaying();
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const closeRoom = rooms?.closeRoom;
  const repairSync = rooms?.repairSync;
  const resolvedPlayback = rooms?.resolvedPlayback ?? null;
  const skipRoom = rooms?.skipRoom;
  const syncState = rooms?.syncState ?? {
    code: "idle",
    label: "Not listening to a room",
    driftMs: null,
  };
  const roomTrack = toRoomTrack(resolvedPlayback?.currentQueueItem ?? null);
  const isRoomMode = activeRoom !== null;
  const roomPaused = resolvedPlayback?.paused ?? false;
  const canControlPlayback = !!activeRoom?.playback.canControlPlayback;
  const hasRoomTrack = !!resolvedPlayback?.currentQueueItem;
  const canToggleListening = hasRoomTrack;
  const displayArtist = activeRoom
    ? roomTrack
      ? `${activeRoom.room.name} • ${roomTrack.artist}`
      : activeRoom.room.name
    : nowPlaying.displayArtist;
  const displayDuration = activeRoom
    ? (roomTrack?.durationMs ?? 0)
    : nowPlaying.displayDuration;
  const displayImage = activeRoom
    ? (roomTrack?.albumImage ?? null)
    : nowPlaying.displayImage;
  const displayName = activeRoom
    ? (roomTrack?.name ?? activeRoom.room.name)
    : nowPlaying.displayName;
  const displayProgress = activeRoom
    ? (resolvedPlayback?.currentOffsetMs ?? 0)
    : nowPlaying.displayProgress;
  const expanded = nowPlaying.expanded;
  const hasQueue = isRoomMode
    ? activeRoom.queue.length > 1
    : nowPlaying.hasQueue;
  const palette = nowPlaying.palette;
  const pct =
    displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;
  const volume = nowPlaying.volume;
  const setExpanded = nowPlaying.setExpanded;
  const setVolume = nowPlaying.setVolume;
  const [draftVolume, setDraftVolume] = useState(volume);

  useEffect(() => {
    setDraftVolume(volume);
  }, [volume]);

  const commitVolume = async (nextVolume: number) => {
    if (nextVolume === volume) return;
    await setVolume(nextVolume);
  };

  const handleRoomToggle = () => {
    if (!activeRoom) {
      return;
    }

    if (!resolvedPlayback?.currentQueueItem) {
      return;
    }

    if (roomPaused) {
      repairSync?.();
      return;
    }

    if (!closeRoom) {
      return;
    }

    void closeRoom();
  };

  return (
    <PlayerWrapper
      shaderProps={{
        colorA: palette[0],
        colorB: palette[2],
        detail: 1,
        speed: 0.5,
      }}
      toggled={expanded}
    >
      <div className="p-7 pb-2 rounded-3xl">
        <AlbumArt src={displayImage} className="mb-9 mx-auto size-80" />
        <header className="mb-5 mix-blend-plus-darker dark:mix-blend-plus-lighter space-y-6">
          <div className="flex gap-6 items-start">
            <div className="flex-auto isolate min-w-0 space-y-0.5">
              <h2 className="text-lg truncate">{displayName}</h2>
              <h5 className="font-medium opacity-33 text-sm truncate">
                {displayArtist}
              </h5>
            </div>
            {activeRoom ? (
              <RoomStatusBadge
                syncState={syncState}
                label={formatRoomSyncLabel(syncState)}
              />
            ) : null}
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

        <nav className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-8 mix-blend-plus-darker dark:mix-blend-plus-lighter">
          <div className="flex flex-auto gap-3 items-center justify-end">
            {!isRoomMode && hasQueue && (
              <>
                <ShuffleButton />
                <PrevTrackButton />
              </>
            )}
          </div>
          {isRoomMode ? (
            <Button
              size="icon-2xl"
              disabled={!canToggleListening}
              onClick={handleRoomToggle}
            >
              {roomPaused ? (
                <PlayIcon fill="currentColor" strokeWidth={0} />
              ) : (
                <PauseIcon fill="currentColor" strokeWidth={0} />
              )}
            </Button>
          ) : (
            <TogglePlayButton size="icon-2xl" />
          )}
          <div className="flex flex-auto gap-3 items-center justify-start">
            {isRoomMode ? (
              canControlPlayback && hasRoomTrack ? (
                <Button
                  size="icon-lg"
                  onClick={() =>
                    skipRoom ? void skipRoom(activeRoom.room._id) : undefined
                  }
                >
                  <SkipForwardIcon />
                </Button>
              ) : null
            ) : hasQueue ? (
              <>
                <NextTrackButton />
                <RepeatButton />
              </>
            ) : null}
          </div>
        </nav>

        <div className="flex gap-2 items-center mb-2 -mx-3">
          <Button variant="overlay" size="icon">
            <VolumeIcon className="translate-x-1" />
          </Button>
          <Slider
            min={0}
            max={100}
            value={draftVolume}
            onValueChange={(value) => setDraftVolume(Number(value))}
            onValueCommitted={(value) => {
              void commitVolume(Number(value));
            }}
            className="flex-auto "
          />
          <Button variant="overlay" size="icon">
            <Volume2Icon className="translate-x-px" />
          </Button>
        </div>

        <footer className="grid grid-cols-[auto_1fr] gap-1 items-center -mx-3">
          <Button
            variant="overlay"
            size="icon-xl"
            onClick={() => setExpanded(false)}
            className="-ml-1.5"
          >
            <ChevronsDownIcon />
          </Button>
          <div className="flex gap-1 items-center justify-end">
            {isRoomMode ? (
              <Button variant="overlay" size="sm" onClick={repairSync}>
                Sync
              </Button>
            ) : (
              <>
                <AlbumButton />
                <QueueButton />
              </>
            )}
          </div>
        </footer>
        {isRoomMode ? <RoomPlayerPanel /> : null}
      </div>
    </PlayerWrapper>
  );
}
