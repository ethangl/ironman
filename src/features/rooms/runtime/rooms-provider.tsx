import { useMemo, type ReactNode } from "react";

import { useAuthenticatedSession } from "@/app";
import { RoomsContext, type RoomsContextValue } from "./rooms-context";
import { useRoomMembershipActions } from "./use-room-membership-actions";
import { useRoomPlaybackActions } from "./use-room-playback-actions";
import { useRoomQueueActions } from "./use-room-queue-actions";
import { useRoomRuntimeState } from "./use-room-runtime-state";
import { useRoomSyncController } from "./use-room-sync-controller";

export function RoomsProvider({ children }: { children: ReactNode }) {
  const session = useAuthenticatedSession();
  const runtime = useRoomRuntimeState(session.user.id);
  const sync = useRoomSyncController({
    activeRoom: runtime.activeRoom,
    resolvedPlayback: runtime.resolvedPlayback,
  });
  const membership = useRoomMembershipActions({
    activeRoomId: runtime.activeRoomId,
    onJoinRoom: sync.requestSync,
    selectActiveRoom: runtime.selectActiveRoom,
  });
  const queue = useRoomQueueActions(runtime.activeRoomId);
  const playback = useRoomPlaybackActions();

  const value = useMemo<RoomsContextValue>(
    () => ({
      activeRoom: runtime.activeRoom,
      activeRoomId: runtime.activeRoomId,
      activeRoomLoading: runtime.activeRoomLoading,
      clearQueue: queue.clearQueue,
      createRoom: membership.createRoom,
      enqueueTrack: queue.enqueueTrack,
      enqueueTracks: queue.enqueueTracks,
      isListeningToRoom: sync.isListeningToRoom,
      joinRoom: membership.joinRoom,
      leaveRoom: membership.leaveRoom,
      moveQueueItem: queue.moveQueueItem,
      removeQueueItem: queue.removeQueueItem,
      repairSync: sync.repairSync,
      resolvedPlayback: runtime.resolvedPlayback,
      rooms: runtime.rooms,
      roomsLoading: runtime.roomsLoading,
      selectActiveRoom: runtime.selectActiveRoom,
      skipRoom: playback.skipRoom,
      stopListening: sync.stopListening,
      syncState: sync.syncState,
    }),
    [
      membership.createRoom,
      membership.joinRoom,
      membership.leaveRoom,
      playback.skipRoom,
      queue.clearQueue,
      queue.enqueueTrack,
      queue.enqueueTracks,
      queue.moveQueueItem,
      queue.removeQueueItem,
      runtime.activeRoom,
      runtime.activeRoomId,
      runtime.activeRoomLoading,
      runtime.resolvedPlayback,
      runtime.rooms,
      runtime.roomsLoading,
      runtime.selectActiveRoom,
      sync.isListeningToRoom,
      sync.repairSync,
      sync.stopListening,
      sync.syncState,
    ],
  );

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export { useOptionalRooms, useRooms } from "./rooms-context";
