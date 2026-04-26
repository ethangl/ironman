import { api } from "@api";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

import type { RoomId } from "../rooms/client/room-types";
import type { ResolvedRoomPlayback } from "../rooms/runtime/room-sync";

export function useRoomActivityRecorder({
  joinedAt,
  resolvedPlayback,
  roomId,
}: {
  joinedAt: number;
  resolvedPlayback: ResolvedRoomPlayback | null;
  roomId: RoomId;
}) {
  const recordCurrentTrackStarted = useMutation(
    api.rooms.recordCurrentTrackStarted,
  );
  const recordedQueueItemsRef = useRef(new Set<string>());
  const currentQueueItemId = resolvedPlayback?.currentQueueItemId ?? null;
  const startedAt = resolvedPlayback?.startedAt ?? null;

  useEffect(() => {
    recordedQueueItemsRef.current.clear();
  }, [joinedAt, roomId]);

  useEffect(() => {
    if (!currentQueueItemId || startedAt === null || startedAt < joinedAt) {
      return;
    }

    const key = `${roomId}:${currentQueueItemId}`;
    if (recordedQueueItemsRef.current.has(key)) {
      return;
    }

    recordedQueueItemsRef.current.add(key);
    void recordCurrentTrackStarted({
      roomId,
      queueItemId: currentQueueItemId,
    }).catch(() => {
      recordedQueueItemsRef.current.delete(key);
    });
  }, [
    currentQueueItemId,
    joinedAt,
    recordCurrentTrackStarted,
    roomId,
    startedAt,
  ]);
}
