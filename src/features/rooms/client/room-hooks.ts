import { api } from "@api";

import { useStableQuery } from "@/hooks/use-stable-query";
import type { RoomDetails, RoomId, RoomPlaybackSnapshot, RoomSummary } from "./room-types";

interface QueryState<TData> {
  data: TData | null;
  loading: boolean;
  notFound: boolean;
}

export function useRoomList(): QueryState<RoomSummary[]> {
  const rooms = useStableQuery(api.rooms.list, {});

  return {
    data: (rooms as RoomSummary[] | undefined) ?? null,
    loading: rooms === undefined,
    notFound: false,
  };
}

export function useRoomDetails(roomId: RoomId | null): QueryState<RoomDetails> {
  const summary = useStableQuery(
    api.rooms.get,
    roomId ? { roomId } : "skip",
  );
  const queue = useStableQuery(
    api.rooms.getQueue,
    roomId ? { roomId } : "skip",
  );
  const playback = useStableQuery(
    api.rooms.getPlaybackState,
    roomId ? { roomId } : "skip",
  );

  if (!roomId) {
    return { data: null, loading: false, notFound: false };
  }

  const loading =
    summary === undefined || queue === undefined || playback === undefined;
  const notFound = summary === null || queue === null || playback === null;

  if (loading || notFound || !summary || !queue || !playback) {
    return {
      data: null,
      loading,
      notFound,
    };
  }

  return {
    data: {
      room: summary.room,
      viewerMembership: summary.viewerMembership,
      memberCount: summary.memberCount,
      queueLength: summary.queueLength,
      queue: queue.queue,
      playback: playback as RoomPlaybackSnapshot,
    },
    loading: false,
    notFound: false,
  };
}
