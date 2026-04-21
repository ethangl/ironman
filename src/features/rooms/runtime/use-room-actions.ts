import { api } from "@api";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import { toast } from "sonner";

import type { SpotifyTrack } from "@/features/spotify-client/types";
import type { RoomId, RoomQueueItemId } from "../client/room-types";

function reportRoomError(error: unknown) {
  toast.error(
    error instanceof Error && error.message
      ? error.message
      : "Something went wrong.",
  );
}

function getRequiredRoomId(roomId: RoomId | null | undefined) {
  if (roomId) {
    return roomId;
  }

  toast.error("Join a room before you add tracks.");
  return null;
}

function toQueuedTrack(track: SpotifyTrack) {
  return {
    trackId: track.id,
    trackName: track.name,
    trackArtists: [track.artist],
    trackImageUrl: track.albumImage ?? undefined,
    trackDurationMs: track.durationMs,
  };
}

interface UseRoomActionsOptions {
  activeRoomId: RoomId | null;
  onJoinRoom: (roomId: RoomId) => void;
  selectActiveRoom: (roomId: RoomId | null) => void;
}

export function useRoomActions({
  activeRoomId,
  onJoinRoom,
  selectActiveRoom,
}: UseRoomActionsOptions) {
  const createRoomMutation = useMutation(api.rooms.create);
  const joinRoomMutation = useMutation(api.rooms.join);
  const leaveRoomMutation = useMutation(api.rooms.leave);
  const enqueueTrackMutation = useMutation(api.rooms.enqueueTrack);
  const enqueueTracksMutation = useMutation(api.rooms.enqueueTracks);
  const removeQueueItemMutation = useMutation(api.rooms.removeQueueItem);
  const moveQueueItemMutation = useMutation(api.rooms.moveQueueItem);
  const clearQueueMutation = useMutation(api.rooms.clearQueue);
  const skipRoomMutation = useMutation(api.rooms.skip);

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

  const enqueueTrack = useCallback(
    async (track: SpotifyTrack, roomId?: RoomId | null) => {
      const nextRoomId = getRequiredRoomId(roomId ?? activeRoomId);
      if (!nextRoomId) {
        return;
      }

      try {
        await enqueueTrackMutation({
          roomId: nextRoomId,
          ...toQueuedTrack(track),
        });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [activeRoomId, enqueueTrackMutation],
  );

  const enqueueTracks = useCallback(
    async (tracks: SpotifyTrack[], roomId?: RoomId | null) => {
      const nextRoomId = getRequiredRoomId(roomId ?? activeRoomId);
      if (!nextRoomId) {
        return;
      }

      if (tracks.length === 0) {
        toast.error("That playlist does not have any playable tracks.");
        return;
      }

      try {
        await enqueueTracksMutation({
          roomId: nextRoomId,
          tracks: tracks.map(toQueuedTrack),
        });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [activeRoomId, enqueueTracksMutation],
  );

  const removeQueueItem = useCallback(
    async (roomId: RoomId, queueItemId: RoomQueueItemId) => {
      try {
        await removeQueueItemMutation({ roomId, queueItemId });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [removeQueueItemMutation],
  );

  const moveQueueItem = useCallback(
    async (
      roomId: RoomId,
      queueItemId: RoomQueueItemId,
      targetIndex: number,
    ) => {
      try {
        await moveQueueItemMutation({ roomId, queueItemId, targetIndex });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [moveQueueItemMutation],
  );

  const clearQueue = useCallback(
    async (roomId: RoomId) => {
      try {
        await clearQueueMutation({ roomId });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [clearQueueMutation],
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

  return {
    clearQueue,
    createRoom,
    enqueueTrack,
    enqueueTracks,
    joinRoom,
    leaveRoom,
    moveQueueItem,
    removeQueueItem,
    skipRoom,
  };
}
