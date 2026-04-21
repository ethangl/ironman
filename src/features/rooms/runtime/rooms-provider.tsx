import { useMemo, type ReactNode } from "react";

import { useRoomDetails, useRoomList } from "../client/room-hooks";
import { type RoomDetails, type RoomSummary } from "../client/room-types";
import { RoomsContext, type RoomsContextValue } from "./rooms-context";
import type { ResolvedRoomPlayback } from "./room-sync";
import { useRoomActions } from "./use-room-actions";
import { useRoomPageState } from "./use-room-page-state";
import { useRoomSyncController } from "./use-room-sync-controller";

interface RoomRuntimeState {
  activeRoom: RoomDetails | null;
  activeRoomLoading: boolean;
  roomId: Parameters<ReturnType<typeof useRoomPageState>["openRoom"]>[0] | null;
  resolvedPlayback: ResolvedRoomPlayback | null;
  rooms: RoomSummary[];
  roomsLoading: boolean;
  closeRoom: () => Promise<void>;
  openRoom: (roomId: Parameters<ReturnType<typeof useRoomPageState>["openRoom"]>[0]) => Promise<void>;
}

function useRoomRuntimeState(): RoomRuntimeState {
  const roomsQuery = useRoomList();
  const { closeRoom, openRoom, roomId } = useRoomPageState();
  const activeRoomQuery = useRoomDetails(roomId ?? undefined);
  const activeRoom = activeRoomQuery.data?.viewerMembership
    ? activeRoomQuery.data
    : null;

  return useMemo(
    () => ({
      activeRoom,
      activeRoomLoading: activeRoomQuery.loading,
      closeRoom,
      openRoom,
      roomId,
      resolvedPlayback: activeRoomQuery.resolvedPlayback,
      rooms: roomsQuery.data ?? [],
      roomsLoading: roomsQuery.loading,
    }),
    [
      activeRoom,
      activeRoomQuery.loading,
      activeRoomQuery.resolvedPlayback,
      closeRoom,
      openRoom,
      roomId,
      roomsQuery.data,
      roomsQuery.loading,
    ],
  );
}

export function RoomsProvider({ children }: { children: ReactNode }) {
  const runtime = useRoomRuntimeState();
  const sync = useRoomSyncController({
    activeRoom: runtime.activeRoom,
    roomId: runtime.roomId,
    resolvedPlayback: runtime.resolvedPlayback,
  });
  const actions = useRoomActions({
    roomId: runtime.roomId,
    closeRoom: runtime.closeRoom,
    onJoinRoom: sync.requestSync,
    openRoom: runtime.openRoom,
  });

  const value = useMemo<RoomsContextValue>(
    () => ({
      activeRoom: runtime.activeRoom,
      activeRoomLoading: runtime.activeRoomLoading,
      closeRoom: actions.closeRoom,
      clearQueue: actions.clearQueue,
      createRoom: actions.createRoom,
      enqueueTrack: actions.enqueueTrack,
      enqueueTracks: actions.enqueueTracks,
      joinRoom: actions.joinRoom,
      leaveRoom: actions.leaveRoom,
      moveQueueItem: actions.moveQueueItem,
      openRoom: actions.openRoom,
      removeQueueItem: actions.removeQueueItem,
      repairSync: sync.repairSync,
      resolvedPlayback: runtime.resolvedPlayback,
      rooms: runtime.rooms,
      roomsLoading: runtime.roomsLoading,
      skipRoom: actions.skipRoom,
      syncState: sync.syncState,
    }),
    [
      actions.closeRoom,
      actions.clearQueue,
      actions.createRoom,
      actions.enqueueTrack,
      actions.enqueueTracks,
      actions.joinRoom,
      actions.leaveRoom,
      actions.moveQueueItem,
      actions.openRoom,
      actions.removeQueueItem,
      actions.skipRoom,
      runtime.activeRoom,
      runtime.activeRoomLoading,
      runtime.roomId,
      runtime.resolvedPlayback,
      runtime.rooms,
      runtime.roomsLoading,
      sync.repairSync,
      sync.syncState,
    ],
  );

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export { useOptionalRooms, useRooms } from "./rooms-context";
