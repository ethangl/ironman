import { useMemo, type ReactNode } from "react";

import { useAuthenticatedSession } from "@/app/require-authenticated-session";
import { RoomsContext, type RoomsContextValue } from "./rooms-context";
import { useRoomActions } from "./use-room-actions";
import { useRoomRuntimeState } from "./use-room-runtime-state";
import { useRoomSyncController } from "./use-room-sync-controller";

export function RoomsProvider({ children }: { children: ReactNode }) {
  const session = useAuthenticatedSession();
  const runtime = useRoomRuntimeState(session.user.id);
  const sync = useRoomSyncController({
    activeRoom: runtime.activeRoom,
    resolvedPlayback: runtime.resolvedPlayback,
  });
  const actions = useRoomActions({
    activeRoomId: runtime.activeRoomId,
    onJoinRoom: sync.requestSync,
    selectActiveRoom: runtime.selectActiveRoom,
  });

  const value = useMemo<RoomsContextValue>(
    () => ({
      activeRoom: runtime.activeRoom,
      activeRoomId: runtime.activeRoomId,
      activeRoomLoading: runtime.activeRoomLoading,
      clearQueue: actions.clearQueue,
      createRoom: actions.createRoom,
      enqueueTrack: actions.enqueueTrack,
      enqueueTracks: actions.enqueueTracks,
      isListeningToRoom: sync.isListeningToRoom,
      joinRoom: actions.joinRoom,
      leaveRoom: actions.leaveRoom,
      moveQueueItem: actions.moveQueueItem,
      removeQueueItem: actions.removeQueueItem,
      repairSync: sync.repairSync,
      resolvedPlayback: runtime.resolvedPlayback,
      rooms: runtime.rooms,
      roomsLoading: runtime.roomsLoading,
      selectActiveRoom: runtime.selectActiveRoom,
      skipRoom: actions.skipRoom,
      stopListening: sync.stopListening,
      syncState: sync.syncState,
    }),
    [
      actions.clearQueue,
      actions.createRoom,
      actions.enqueueTrack,
      actions.enqueueTracks,
      actions.joinRoom,
      actions.leaveRoom,
      actions.moveQueueItem,
      actions.removeQueueItem,
      actions.skipRoom,
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
