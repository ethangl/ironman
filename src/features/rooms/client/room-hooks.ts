import { useEffect, useMemo, useState } from "react";

import { api } from "@api";

import { useStableQuery } from "@/hooks/use-stable-query";
import {
  type ResolvedRoomPlayback,
  resolveRoomPlayback,
} from "../runtime/room-sync";
import type {
  RoomDetails,
  RoomId,
  RoomPlaybackSnapshot,
  RoomSummary,
} from "./room-types";

interface QueryState<TData> {
  data: TData | null;
  loading: boolean;
  notFound: boolean;
}

interface RoomDetailsQueryState extends QueryState<RoomDetails> {
  resolvedPlayback: ResolvedRoomPlayback | null;
}

export function useRoomList(): QueryState<RoomSummary[]> {
  const rooms = useStableQuery(api.rooms.list, {});

  return {
    data: (rooms as RoomSummary[] | undefined) ?? null,
    loading: rooms === undefined,
    notFound: false,
  };
}

export function useRoomDetails(
  roomId: RoomId | undefined,
): RoomDetailsQueryState {
  const summary = useStableQuery(api.rooms.get, roomId ? { roomId } : "skip");
  const queue = useStableQuery(
    api.rooms.getQueue,
    roomId ? { roomId } : "skip",
  );
  const playback = useStableQuery(
    api.rooms.getPlaybackState,
    roomId ? { roomId } : "skip",
  );

  const loading =
    !!roomId &&
    (summary === undefined || queue === undefined || playback === undefined);
  const notFound =
    !!roomId && (summary === null || queue === null || playback === null);
  const data = useMemo(
    () =>
      !roomId || loading || notFound || !summary || !queue || !playback
        ? null
        : {
            room: summary.room,
            viewerMembership: summary.viewerMembership,
            memberCount: summary.memberCount,
            queueLength: summary.queueLength,
            queue: queue.queue,
            playback: playback as RoomPlaybackSnapshot,
          },
    [loading, notFound, playback, queue, summary],
  );
  const [now, setNow] = useState(() => Date.now());
  const hasRoomData = data !== null;
  const roomPlaybackPaused = data?.playback.paused ?? true;

  useEffect(() => {
    if (!hasRoomData || roomPlaybackPaused) {
      setNow(Date.now());
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasRoomData, roomId, roomPlaybackPaused]);

  const resolvedPlayback = useMemo(
    () => resolveRoomPlayback(data, now),
    [data, now],
  );

  if (!roomId || loading || notFound || !data) {
    return {
      data: null,
      loading: roomId ? loading : false,
      notFound: roomId ? notFound : false,
      resolvedPlayback: null,
    };
  }

  return {
    data,
    loading: false,
    notFound: false,
    resolvedPlayback,
  };
}
