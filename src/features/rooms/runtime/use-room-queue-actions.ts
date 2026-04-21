import { api } from "@api";
import { useMutation } from "convex/react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import type { SpotifyTrack } from "@/features/spotify-client/types";
import type { RoomId, RoomQueueItemId } from "../client/room-types";
import { reportRoomError } from "./room-runtime-utils";

export function useRoomQueueActions(activeRoomId: RoomId | null) {
  const enqueueTrackMutation = useMutation(api.rooms.enqueueTrack);
  const enqueueTracksMutation = useMutation(api.rooms.enqueueTracks);
  const removeQueueItemMutation = useMutation(api.rooms.removeQueueItem);
  const moveQueueItemMutation = useMutation(api.rooms.moveQueueItem);
  const clearQueueMutation = useMutation(api.rooms.clearQueue);

  const enqueueTrack = useCallback(
    async (track: SpotifyTrack, roomId?: RoomId | null) => {
      const nextRoomId = roomId ?? activeRoomId;
      if (!nextRoomId) {
        toast.error("Join a room before you add tracks.");
        return;
      }

      try {
        await enqueueTrackMutation({
          roomId: nextRoomId,
          trackId: track.id,
          trackName: track.name,
          trackArtists: [track.artist],
          trackImageUrl: track.albumImage ?? undefined,
          trackDurationMs: track.durationMs,
        });
      } catch (error) {
        reportRoomError(error);
      }
    },
    [activeRoomId, enqueueTrackMutation],
  );

  const enqueueTracks = useCallback(
    async (tracks: SpotifyTrack[], roomId?: RoomId | null) => {
      const nextRoomId = roomId ?? activeRoomId;
      if (!nextRoomId) {
        toast.error("Join a room before you add tracks.");
        return;
      }

      if (tracks.length === 0) {
        toast.error("That playlist does not have any playable tracks.");
        return;
      }

      try {
        await enqueueTracksMutation({
          roomId: nextRoomId,
          tracks: tracks.map((track) => ({
            trackId: track.id,
            trackName: track.name,
            trackArtists: [track.artist],
            trackImageUrl: track.albumImage ?? undefined,
            trackDurationMs: track.durationMs,
          })),
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

  return useMemo(
    () => ({
      clearQueue,
      enqueueTrack,
      enqueueTracks,
      moveQueueItem,
      removeQueueItem,
    }),
    [clearQueue, enqueueTrack, enqueueTracks, moveQueueItem, removeQueueItem],
  );
}
