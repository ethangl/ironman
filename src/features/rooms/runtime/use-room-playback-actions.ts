import { api } from "@api";
import { useMutation } from "convex/react";
import { useCallback, useMemo } from "react";

import type { RoomId } from "../client/room-types";
import { reportRoomError } from "./room-runtime-utils";

export function useRoomPlaybackActions() {
  const skipRoomMutation = useMutation(api.rooms.skip);

  const skipRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await skipRoomMutation({ roomId });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [skipRoomMutation],
  );

  return useMemo(
    () => ({
      skipRoom,
    }),
    [skipRoom],
  );
}
