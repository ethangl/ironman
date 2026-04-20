import { api } from "@api";
import { useMutation } from "convex/react";
import { useCallback, useMemo } from "react";

import type { RoomId } from "../client/room-types";
import { reportRoomError } from "./room-runtime-utils";

interface UseRoomMembershipActionsOptions {
  activeRoomId: RoomId | null;
  onJoinRoom: (roomId: RoomId) => void;
  selectActiveRoom: (roomId: RoomId | null) => void;
}

export function useRoomMembershipActions({
  activeRoomId,
  onJoinRoom,
  selectActiveRoom,
}: UseRoomMembershipActionsOptions) {
  const createRoomMutation = useMutation(api.rooms.create);
  const joinRoomMutation = useMutation(api.rooms.join);
  const leaveRoomMutation = useMutation(api.rooms.leave);

  const createRoom = useCallback(
    async ({ name, description }: { name: string; description?: string }) => {
      try {
        const result = await createRoomMutation({
          name,
          description: description?.trim() || undefined,
        });
        const roomId = result.roomId as RoomId;
        selectActiveRoom(roomId);
        onJoinRoom(roomId);
        return roomId;
      } catch (error) {
        reportRoomError(error);
        return null;
      }
    },
    [createRoomMutation, onJoinRoom, selectActiveRoom],
  );

  const joinRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await joinRoomMutation({ roomId });
        selectActiveRoom(roomId);
        onJoinRoom(roomId);
      } catch (error) {
        reportRoomError(error);
      }
    },
    [joinRoomMutation, onJoinRoom, selectActiveRoom],
  );

  const leaveRoom = useCallback(
    async (roomId?: RoomId | null) => {
      const nextRoomId = roomId ?? activeRoomId;
      if (!nextRoomId) {
        return;
      }

      try {
        await leaveRoomMutation({ roomId: nextRoomId });
        if (nextRoomId === activeRoomId) {
          selectActiveRoom(null);
        }
      } catch (error) {
        reportRoomError(error);
      }
    },
    [activeRoomId, leaveRoomMutation, selectActiveRoom],
  );

  return useMemo(
    () => ({
      createRoom,
      joinRoom,
      leaveRoom,
    }),
    [createRoom, joinRoom, leaveRoom],
  );
}
