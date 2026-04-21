import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  useWebPlayerActions,
  useWebPlayerState,
} from "@/features/spotify-player";
import type { RoomDetails, RoomSyncState } from "../client/room-types";
import { toRoomTrack } from "../client/room-utils";
import { getRoomSyncState, type ResolvedRoomPlayback } from "./room-sync";

interface UseRoomSyncControllerOptions {
  activeRoom: RoomDetails | null;
  roomId: string | null;
  resolvedPlayback: ResolvedRoomPlayback | null;
}

interface RoomSyncController {
  repairSync: () => void;
  requestSync: () => void;
  syncState: RoomSyncState;
}

export function useRoomSyncController({
  activeRoom,
  roomId,
  resolvedPlayback,
}: UseRoomSyncControllerOptions): RoomSyncController {
  const { syncTrack, togglePlay } = useWebPlayerActions();
  const { sdkState } = useWebPlayerState();
  const [syncNonce, setSyncNonce] = useState(0);
  const lastRequestedSyncKeyRef = useRef<string | null>(null);
  const previousRoomIdRef = useRef<string | null>(roomId);

  const hasActiveMembership = !!activeRoom?.viewerMembership;
  const activeRoomId = activeRoom?.room._id ?? null;
  const currentQueueItem = resolvedPlayback?.currentQueueItem ?? null;
  const currentQueueItemId = currentQueueItem?._id ?? null;
  const currentTrackId = currentQueueItem?.trackId ?? null;
  const currentOffsetMs = resolvedPlayback?.currentOffsetMs ?? 0;
  const startedAt = resolvedPlayback?.startedAt ?? null;
  const startOffsetMs = resolvedPlayback?.startOffsetMs ?? 0;
  const roomPaused = resolvedPlayback?.paused ?? false;
  const sdkTrackId = sdkState?.trackId ?? null;
  const sdkPaused = sdkState?.paused ?? true;

  const syncState = useMemo(
    () =>
      getRoomSyncState({
        hasActiveMembership,
        resolvedPlayback,
      }),
    [hasActiveMembership, resolvedPlayback],
  );

  const requestSync = useCallback(() => {
    setSyncNonce((current) => current + 1);
  }, []);

  useEffect(() => {
    if (
      previousRoomIdRef.current &&
      !roomId &&
      !sdkPaused
    ) {
      void togglePlay();
    }

    previousRoomIdRef.current = roomId;
  }, [roomId, sdkPaused, togglePlay]);

  const runSyncToRoom = useCallback(async () => {
    if (
      !hasActiveMembership ||
      !currentQueueItem ||
      roomPaused
    ) {
      return;
    }

    const roomTrack = toRoomTrack(currentQueueItem);
    if (!roomTrack) {
      return;
    }

    await syncTrack(roomTrack, currentOffsetMs);
  }, [
    currentOffsetMs,
    currentQueueItem,
    hasActiveMembership,
    roomPaused,
    syncTrack,
  ]);

  useEffect(() => {
    if (
      !activeRoomId ||
      !hasActiveMembership ||
      !currentQueueItemId ||
      roomPaused
    ) {
      return;
    }

    const syncKey = [
      activeRoomId,
      currentQueueItemId,
      startedAt ?? "none",
      startOffsetMs,
      syncNonce,
    ].join(":");

    if (lastRequestedSyncKeyRef.current === syncKey) {
      return;
    }

    lastRequestedSyncKeyRef.current = syncKey;
    void runSyncToRoom();
  }, [
    activeRoomId,
    currentQueueItemId,
    hasActiveMembership,
    roomPaused,
    runSyncToRoom,
    startOffsetMs,
    startedAt,
    syncNonce,
  ]);

  useEffect(() => {
    if (
      !hasActiveMembership ||
      !currentTrackId ||
      !sdkTrackId ||
      sdkPaused ||
      !roomPaused
    ) {
      return;
    }

    if (sdkTrackId !== currentTrackId) {
      return;
    }

    void togglePlay();
  }, [
    currentTrackId,
    hasActiveMembership,
    roomPaused,
    sdkPaused,
    sdkTrackId,
    togglePlay,
  ]);

  return useMemo(
    () => ({
      repairSync: () => requestSync(),
      requestSync,
      syncState,
    }),
    [requestSync, syncState],
  );
}
