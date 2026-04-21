import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuthenticatedSession } from "@/app/require-authenticated-session";
import { useRoomDetails, useRoomList } from "../client/room-hooks";
import type { RoomDetails, RoomId, RoomSummary } from "../client/room-types";
import { RoomsContext, type RoomsContextValue } from "./rooms-context";
import type { ResolvedRoomPlayback } from "./room-sync";
import { useRoomActions } from "./use-room-actions";
import { useRoomSyncController } from "./use-room-sync-controller";

const ACTIVE_ROOM_STORAGE_KEY = "rooms.activeRoomId";

function readActiveRoomId() {
  if (typeof window === "undefined") {
    return null;
  }

  const roomId = window.localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
  return roomId as RoomId | null;
}

interface RoomRuntimeState {
  activeRoom: RoomDetails | null;
  activeRoomId: RoomId | null;
  activeRoomLoading: boolean;
  resolvedPlayback: ResolvedRoomPlayback | null;
  rooms: RoomSummary[];
  roomsLoading: boolean;
  selectActiveRoom: (roomId: RoomId | null) => void;
}

function useRoomRuntimeState(sessionUserId: string | null): RoomRuntimeState {
  const roomsQuery = useRoomList();
  const [activeRoomId, setActiveRoomId] = useState<RoomId | null>(() =>
    readActiveRoomId(),
  );
  const activeRoomQuery = useRoomDetails(activeRoomId ?? undefined);
  const activeRoom = activeRoomQuery.data?.viewerMembership
    ? activeRoomQuery.data
    : null;
  const hasActiveRoomData = activeRoomQuery.data !== null;
  const hasActiveMembership = !!activeRoomQuery.data?.viewerMembership;

  useEffect(() => {
    if (!sessionUserId) {
      setActiveRoomId(null);
    }
  }, [sessionUserId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!activeRoomId) {
      window.localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, activeRoomId);
  }, [activeRoomId]);

  useEffect(() => {
    if (activeRoomId && activeRoomQuery.notFound) {
      setActiveRoomId(null);
    }
  }, [activeRoomId, activeRoomQuery.notFound]);

  useEffect(() => {
    if (activeRoomQuery.loading || !hasActiveRoomData) {
      return;
    }

    if (!hasActiveMembership) {
      setActiveRoomId(null);
    }
  }, [activeRoomQuery.loading, hasActiveMembership, hasActiveRoomData]);

  const selectActiveRoom = useCallback((roomId: RoomId | null) => {
    setActiveRoomId(roomId);
  }, []);

  return useMemo(
    () => ({
      activeRoom,
      activeRoomId,
      activeRoomLoading: activeRoomQuery.loading,
      resolvedPlayback: activeRoomQuery.resolvedPlayback,
      rooms: roomsQuery.data ?? [],
      roomsLoading: roomsQuery.loading,
      selectActiveRoom,
    }),
    [
      activeRoom,
      activeRoomId,
      activeRoomQuery.loading,
      activeRoomQuery.resolvedPlayback,
      roomsQuery.data,
      roomsQuery.loading,
      selectActiveRoom,
    ],
  );
}

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
