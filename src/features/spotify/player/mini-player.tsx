import { ChevronsUpIcon, SkipForwardIcon } from "lucide-react";

import { AlbumArt } from "@/components/album-art";
import { PlayButton } from "@/components/play-button";
import { Button } from "@/components/ui/button";
import {
  formatRoomSyncLabel,
  toRoomTrack,
  useOptionalRooms,
} from "@/features/rooms";
import { RoomStatusBadge } from "@/features/rooms/ui/room-status-badge";
import { NextTrackButton } from "./next-track-button";
import { PlayerWrapper } from "./player-wrapper";
import { TogglePlayButton } from "./toggle-play-button";
import { useNowPlaying } from "./use-now-playing";

export function MiniPlayer() {
  const nowPlaying = useNowPlaying();
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const isListeningToRoom = rooms?.isListeningToRoom ?? true;
  const repairSync = rooms?.repairSync;
  const resolvedPlayback = rooms?.resolvedPlayback ?? null;
  const skipRoom = rooms?.skipRoom;
  const stopListening = rooms?.stopListening;
  const syncState = rooms?.syncState ?? {
    code: "idle",
    label: "Not listening to a room",
    driftMs: null,
  };
  const roomTrack = toRoomTrack(resolvedPlayback?.currentQueueItem ?? null);
  const isRoomMode = activeRoom !== null;
  const canControlPlayback = !!activeRoom?.playback.canControlPlayback;
  const hasRoomTrack = !!resolvedPlayback?.currentQueueItem;
  const roomPaused = resolvedPlayback?.paused ?? false;
  const canToggleListening =
    hasRoomTrack && !roomPaused;
  const displayImage = activeRoom
    ? roomTrack?.albumImage ?? null
    : nowPlaying.displayImage;
  const displayName = activeRoom
    ? roomTrack?.name ?? activeRoom.room.name
    : nowPlaying.displayName;
  const displayArtist = isRoomMode
    ? activeRoom
      ? `${activeRoom.room.name} • ${formatRoomSyncLabel(syncState)}`
      : ""
    : nowPlaying.displayArtist;

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

    if (isListeningToRoom) {
      if (!stopListening) {
        return;
      }

      void stopListening();
      return;
    }

    repairSync?.();
  };

  return (
    <PlayerWrapper
      className="p-0.5"
      shaderProps={{
        colorA: nowPlaying.palette[0],
        colorB: nowPlaying.palette[2],
        detail: 0.5,
        speed: 0.5,
      }}
      toggled={!nowPlaying.expanded}
    >
      <div className="flex gap-2.5 items-center p-2.5">
        <button
          className="group flex flex-auto gap-2.5 items-center min-w-0"
          onClick={() => nowPlaying.setExpanded(true)}
        >
          <div className="relative size-8">
            <AlbumArt src={displayImage} />
            <div className="absolute backdrop-blur-none group-hover:backdrop-blur-md duration-444 inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-all">
              <ChevronsUpIcon className="absolute inset-0 m-auto size-5 text-white" />
            </div>
          </div>
          <div className="min-w-0 mix-blend-plus-lighter space-y-1.5 text-left truncate">
            <h6 className="leading-none text-xs truncate">{displayName}</h6>
            {isRoomMode ? (
              <div className="flex items-center gap-2">
                <p className="font-medium text-[9px] leading-none opacity-50 truncate">
                  {displayArtist}
                </p>
                <RoomStatusBadge
                  syncState={syncState}
                  label={formatRoomSyncLabel(syncState)}
                  className="px-1.5 py-0.5 text-[8px]"
                />
              </div>
            ) : (
              <p className="font-medium text-[9px] leading-none opacity-50 truncate">
                {displayArtist}
              </p>
            )}
          </div>
        </button>
        <nav className="flex flex-none items-center gap-1 mix-blend-plus-lighter">
          {isRoomMode ? (
            <>
              <PlayButton
                size="icon-sm"
                className="bg-white/10 hover:bg-white/5"
                disabled={!canToggleListening}
                playing={canToggleListening && isListeningToRoom}
                onClick={handleRoomToggle}
              />
              {canControlPlayback ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="bg-white/10 hover:bg-white/5"
                  disabled={!hasRoomTrack}
                  onClick={() =>
                    activeRoom && skipRoom
                      ? void skipRoom(activeRoom.room._id)
                      : undefined
                  }
                >
                  <SkipForwardIcon />
                </Button>
              ) : null}
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
