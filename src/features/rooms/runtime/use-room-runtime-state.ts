import { useCallback, useEffect, useMemo, useState } from "react";

import { useRoomDetails, useRoomList } from "../client/room-hooks";
import type { RoomDetails, RoomId, RoomSummary } from "../client/room-types";
import type { ResolvedRoomPlayback } from "./room-sync";

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

export function useRoomRuntimeState(
  sessionUserId: string | null,
): RoomRuntimeState {
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
