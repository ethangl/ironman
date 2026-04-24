import { parseAsString, useQueryState } from "nuqs";
import { useOptimisticSearchParams } from "nuqs/adapters/react-router/v7";
import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import type { RoomId } from "../client/room-types";

const DEFAULT_ROOM_ID = "kx73krhnfhtqg5kasyvj591t0s856nfw" as RoomId;
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
  const [queryRoomIdValue, setRoomIdValue] = useQueryState(
    "roomId",
    roomIdParser,
  );
  const [defaultRoomClosed, setDefaultRoomClosed] = useState(false);
  const roomIdValue =
    queryRoomIdValue ?? (defaultRoomClosed ? null : DEFAULT_ROOM_ID);
  const roomId = roomIdValue as RoomId | null;

  const openRoom = useCallback(
    async (nextRoomId: RoomId) => {
      setDefaultRoomClosed(false);
      await setRoomIdValue(nextRoomId);
    },
    [setRoomIdValue],
  );

  const closeRoom = useCallback(async () => {
    setDefaultRoomClosed(true);
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
