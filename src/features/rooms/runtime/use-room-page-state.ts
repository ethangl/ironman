import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { parseAsString, useQueryState } from "nuqs";
import { useOptimisticSearchParams } from "nuqs/adapters/react-router/v7";

import type { RoomId } from "../client/room-types";

const roomIdParser = parseAsString.withOptions({ history: "push" });

export function buildRoomPageHref(
  pathname: string,
  search: string,
  roomId: RoomId | null,
) {
  const nextSearchParams = new URLSearchParams(search);

  if (roomId) {
    nextSearchParams.set("roomId", roomId);
  } else {
    nextSearchParams.delete("roomId");
  }

  const nextQuery = nextSearchParams.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

export function useRoomPageState() {
  const [roomIdValue, setRoomIdValue] = useQueryState("roomId", roomIdParser);
  const roomId = roomIdValue as RoomId | null;

  const openRoom = useCallback(
    async (nextRoomId: RoomId) => {
      await setRoomIdValue(nextRoomId);
    },
    [setRoomIdValue],
  );

  const closeRoom = useCallback(async () => {
    await setRoomIdValue(null);
  }, [setRoomIdValue]);

  return useMemo(
    () => ({
      closeRoom,
      openRoom,
      roomId,
    }),
    [closeRoom, openRoom, roomId],
  );
}

export function useRoomPageHref(roomId: RoomId | null) {
  const location = useLocation();
  const searchParams = useOptimisticSearchParams();
  const search = searchParams.toString();

  return useMemo(
    () => buildRoomPageHref(location.pathname, search, roomId),
    [location.pathname, roomId, search],
  );
}
