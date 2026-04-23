import { toRoomTrack, useOptionalRooms } from "@/features/rooms";

import { useWebPlayer } from "./use-web-player";

export function useNowPlaying() {
  const player = useWebPlayer();
  const rooms = useOptionalRooms();
  const { currentTrack, sdkState, progressMs, durationMs } = player;
  const activeRoom = rooms?.activeRoom ?? null;
  const resolvedPlayback = rooms?.resolvedPlayback ?? null;
  const roomTrack = toRoomTrack(resolvedPlayback?.currentQueueItem ?? null);
  const roomName = activeRoom?.room.name ?? "";
  const isRoomMode = activeRoom !== null;
  const roomPaused = resolvedPlayback?.paused ?? false;
  const hasRoomTrack = !!resolvedPlayback?.currentQueueItem;
  const canControlPlayback = !!activeRoom?.playback.canControlPlayback;

  const trackId = currentTrack?.id ?? null;
  const sdkActive = !!(sdkState && trackId && sdkState.trackId === trackId);
  const playerDisplayProgress = sdkActive ? sdkState.position : progressMs;
  const playerDisplayDuration = sdkActive
    ? sdkState!.duration
    : currentTrack?.durationMs ?? durationMs;
  const displayProgress = isRoomMode
    ? (resolvedPlayback?.currentOffsetMs ?? 0)
    : playerDisplayProgress;
  const displayDuration = isRoomMode
    ? (roomTrack?.durationMs ?? 0)
    : playerDisplayDuration;
  const pct =
    displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;
  const displayName = isRoomMode
    ? (roomTrack?.name ?? roomName)
    : currentTrack?.name ?? "";
  const displayArtist = isRoomMode
    ? roomTrack
      ? `${roomName} • ${roomTrack.artist}`
      : roomName
    : currentTrack?.artist ?? "";
  const compactDisplayArtist = isRoomMode ? roomName : displayArtist;
  const displayImage = isRoomMode
    ? (roomTrack?.albumImage ?? null)
    : currentTrack?.albumImage ?? null;
  const displayTrackId = isRoomMode
    ? (roomTrack?.id ?? "")
    : currentTrack?.id ?? "";
  const hasQueue = activeRoom ? activeRoom.queue.length > 1 : player.hasQueue;
  const isPlaying = isRoomMode ? hasRoomTrack : !!currentTrack;

  const toggleRoomListening = () => {
    if (!activeRoom) {
      return;
    }

    if (!resolvedPlayback?.currentQueueItem) {
      return;
    }

    if (roomPaused) {
      rooms?.repairSync?.();
      return;
    }

    if (!rooms?.closeRoom) {
      return;
    }

    void rooms.closeRoom();
  };

  const skipRoomTrack = () => {
    if (!activeRoom || !rooms?.skipRoom) {
      return;
    }

    void rooms.skipRoom(activeRoom.room._id);
  };

  const roomPlayback = activeRoom
    ? {
        activeRoom,
        canControlPlayback,
        canSkip: canControlPlayback && hasRoomTrack,
        canToggleListening: hasRoomTrack,
        hasTrack: hasRoomTrack,
        paused: roomPaused,
        skip: skipRoomTrack,
        track: roomTrack,
        toggleListening: toggleRoomListening,
      }
    : null;

  return {
    ...player,
    activeRoom,
    compactDisplayArtist,
    displayProgress,
    displayDuration,
    pct,
    hasQueue,
    isPlaying,
    isRoomMode,
    displayName,
    displayArtist,
    displayImage,
    displayTrackId,
    roomPlayback,
  };
}
