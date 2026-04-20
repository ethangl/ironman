import { api } from "@api";
import { useMutation } from "convex/react";
import { useCallback, useMemo } from "react";

import type { RoomId, RoomQueueItemId } from "../client/room-types";
import { reportRoomError } from "./room-runtime-utils";

export function useRoomPlaybackActions() {
  const playRoomMutation = useMutation(api.rooms.play);
  const pauseRoomMutation = useMutation(api.rooms.pause);
  const resumeRoomMutation = useMutation(api.rooms.resume);
  const skipRoomMutation = useMutation(api.rooms.skip);

  const playRoom = useCallback(
    async (roomId: RoomId, queueItemId?: RoomQueueItemId) => {
      try {
        await playRoomMutation({ roomId, queueItemId });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [playRoomMutation],
  );

  const pauseRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await pauseRoomMutation({ roomId });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [pauseRoomMutation],
  );

  const resumeRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await resumeRoomMutation({ roomId });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [resumeRoomMutation],
  );

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
      pauseRoom,
      playRoom,
      resumeRoom,
      skipRoom,
    }),
    [pauseRoom, playRoom, resumeRoom, skipRoom],
  );
}
