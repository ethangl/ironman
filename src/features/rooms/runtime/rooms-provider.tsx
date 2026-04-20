import { api } from "@api";
import { useMutation } from "convex/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { useAppAuth } from "@/app";
import {
  useWebPlayerActions,
  useWebPlayerState,
} from "@/features/spotify/player";
import type { SpotifyTrack } from "@/types";
import { useRoomDetails, useRoomList } from "../client/room-hooks";
import type {
  RoomDetails,
  RoomId,
  RoomQueueItemId,
  RoomSummary,
  RoomSyncState,
} from "../client/room-types";
import { toRoomTrack } from "../client/room-utils";
import { getRoomSyncState, type ResolvedRoomPlayback } from "./room-sync";

const ACTIVE_ROOM_STORAGE_KEY = "rooms.activeRoomId";

interface RoomsContextValue {
  activeRoom: RoomDetails | null;
  activeRoomId: RoomId | null;
  activeRoomLoading: boolean;
  resolvedPlayback: ResolvedRoomPlayback | null;
  rooms: RoomSummary[];
  roomsLoading: boolean;
  syncState: RoomSyncState;
  createRoom: (input: {
    name: string;
    description?: string;
  }) => Promise<RoomId | null>;
  joinRoom: (roomId: RoomId) => Promise<void>;
  leaveRoom: (roomId?: RoomId | null) => Promise<void>;
  selectActiveRoom: (roomId: RoomId | null) => void;
  enqueueTrack: (track: SpotifyTrack, roomId?: RoomId | null) => Promise<void>;
  removeQueueItem: (
    roomId: RoomId,
    queueItemId: RoomQueueItemId,
  ) => Promise<void>;
  moveQueueItem: (
    roomId: RoomId,
    queueItemId: RoomQueueItemId,
    targetIndex: number,
  ) => Promise<void>;
  clearQueue: (roomId: RoomId) => Promise<void>;
  playRoom: (roomId: RoomId, queueItemId?: RoomQueueItemId) => Promise<void>;
  pauseRoom: (roomId: RoomId) => Promise<void>;
  resumeRoom: (roomId: RoomId) => Promise<void>;
  skipRoom: (roomId: RoomId) => Promise<void>;
  repairSync: () => void;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

function readActiveRoomId() {
  if (typeof window === "undefined") {
    return null;
  }

  const roomId = window.localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
  return roomId as RoomId | null;
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong.";
}

export function RoomsProvider({ children }: { children: ReactNode }) {
  const { session } = useAppAuth();
  const { syncTrack, togglePlay } = useWebPlayerActions();
  const { sdkState } = useWebPlayerState();
  const roomsQuery = useRoomList();
  const [activeRoomId, setActiveRoomId] = useState<RoomId | null>(() =>
    readActiveRoomId(),
  );
  const [repairNonce, setRepairNonce] = useState(0);
  const activeRoomQuery = useRoomDetails(activeRoomId);
  const createRoomMutation = useMutation(api.rooms.create);
  const joinRoomMutation = useMutation(api.rooms.join);
  const leaveRoomMutation = useMutation(api.rooms.leave);
  const enqueueTrackMutation = useMutation(api.rooms.enqueueTrack);
  const removeQueueItemMutation = useMutation(api.rooms.removeQueueItem);
  const moveQueueItemMutation = useMutation(api.rooms.moveQueueItem);
  const clearQueueMutation = useMutation(api.rooms.clearQueue);
  const playRoomMutation = useMutation(api.rooms.play);
  const pauseRoomMutation = useMutation(api.rooms.pause);
  const resumeRoomMutation = useMutation(api.rooms.resume);
  const skipRoomMutation = useMutation(api.rooms.skip);

  const activeRoom = activeRoomQuery.data?.viewerMembership
    ? activeRoomQuery.data
    : null;
  const resolvedPlayback = activeRoomQuery.resolvedPlayback;

  useEffect(() => {
    if (!session) {
      setActiveRoomId(null);
    }
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!activeRoomId) {
      window.localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, activeRoomId);
  }, [activeRoomId]);

  useEffect(() => {
    if (activeRoomId && activeRoomQuery.notFound) {
      setActiveRoomId(null);
    }
  }, [activeRoomId, activeRoomQuery.notFound]);

  useEffect(() => {
    if (activeRoomQuery.loading || !activeRoomQuery.data) {
      return;
    }

    if (!activeRoomQuery.data.viewerMembership) {
      setActiveRoomId(null);
    }
  }, [activeRoomQuery.data, activeRoomQuery.loading]);

  const syncState = useMemo(
    () =>
      getRoomSyncState({
        hasActiveMembership: !!activeRoom?.viewerMembership,
        resolvedPlayback,
      }),
    [activeRoom, resolvedPlayback],
  );

  const lastRequestedSyncKeyRef = useRef<string | null>(null);

  const runSyncToRoom = useCallback(async () => {
    if (!activeRoom?.viewerMembership || !resolvedPlayback?.currentQueueItem) {
      return;
    }

    if (resolvedPlayback.paused) {
      return;
    }

    const roomTrack = toRoomTrack(resolvedPlayback.currentQueueItem);
    if (!roomTrack) {
      return;
    }

    await syncTrack(roomTrack, resolvedPlayback.currentOffsetMs);
  }, [activeRoom, resolvedPlayback, syncTrack]);

  useEffect(() => {
    if (!activeRoom?.viewerMembership || !resolvedPlayback?.currentQueueItem) {
      return;
    }

    if (resolvedPlayback.paused) {
      return;
    }

    const syncKey = [
      activeRoom.room._id,
      resolvedPlayback.currentQueueItem._id,
      resolvedPlayback.startedAt ?? "none",
      resolvedPlayback.startOffsetMs,
      repairNonce,
    ].join(":");

    if (lastRequestedSyncKeyRef.current === syncKey) {
      return;
    }

    lastRequestedSyncKeyRef.current = syncKey;
    void runSyncToRoom();
  }, [activeRoom, repairNonce, resolvedPlayback, runSyncToRoom]);

  useEffect(() => {
    if (
      !activeRoom?.viewerMembership ||
      !resolvedPlayback?.currentQueueItem ||
      !sdkState ||
      sdkState.paused
    ) {
      return;
    }

    if (!resolvedPlayback.paused) {
      return;
    }

    if (sdkState.trackId !== resolvedPlayback.currentQueueItem.trackId) {
      return;
    }

    void togglePlay();
  }, [activeRoom, resolvedPlayback, sdkState, togglePlay]);

  const selectActiveRoom = useCallback((roomId: RoomId | null) => {
    setActiveRoomId(roomId);
  }, []);

  const createRoom = useCallback(
    async ({ name, description }: { name: string; description?: string }) => {
      try {
        const result = await createRoomMutation({
          name,
          description: description?.trim() || undefined,
        });
        selectActiveRoom(result.roomId);
        setRepairNonce((current) => current + 1);
        return result.roomId as RoomId;
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
        return null;
      }
    },
    [createRoomMutation, selectActiveRoom],
  );

  const joinRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await joinRoomMutation({ roomId });
        selectActiveRoom(roomId);
        setRepairNonce((current) => current + 1);
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
      }
    },
    [joinRoomMutation, selectActiveRoom],
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
        toast.error(normalizeErrorMessage(error));
      }
    },
    [activeRoomId, leaveRoomMutation, selectActiveRoom],
  );

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
        toast.error(normalizeErrorMessage(error));
      }
    },
    [activeRoomId, enqueueTrackMutation],
  );

  const removeQueueItem = useCallback(
    async (roomId: RoomId, queueItemId: RoomQueueItemId) => {
      try {
        await removeQueueItemMutation({ roomId, queueItemId });
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
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
        toast.error(normalizeErrorMessage(error));
      }
    },
    [moveQueueItemMutation],
  );

  const clearQueue = useCallback(
    async (roomId: RoomId) => {
      try {
        await clearQueueMutation({ roomId });
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
      }
    },
    [clearQueueMutation],
  );

  const playRoom = useCallback(
    async (roomId: RoomId, queueItemId?: RoomQueueItemId) => {
      try {
        await playRoomMutation({ roomId, queueItemId });
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
      }
    },
    [playRoomMutation],
  );

  const pauseRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await pauseRoomMutation({ roomId });
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
      }
    },
    [pauseRoomMutation],
  );

  const resumeRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await resumeRoomMutation({ roomId });
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
      }
    },
    [resumeRoomMutation],
  );

  const skipRoom = useCallback(
    async (roomId: RoomId) => {
      try {
        await skipRoomMutation({ roomId });
      } catch (error) {
        toast.error(normalizeErrorMessage(error));
      }
    },
    [skipRoomMutation],
  );

  const repairSync = useCallback(() => {
    setRepairNonce((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      activeRoom,
      activeRoomId,
      activeRoomLoading: activeRoomQuery.loading,
      resolvedPlayback,
      rooms: roomsQuery.data ?? [],
      roomsLoading: roomsQuery.loading,
      syncState,
      createRoom,
      joinRoom,
      leaveRoom,
      selectActiveRoom,
      enqueueTrack,
      removeQueueItem,
      moveQueueItem,
      clearQueue,
      playRoom,
      pauseRoom,
      resumeRoom,
      skipRoom,
      repairSync,
    }),
    [
      activeRoom,
      activeRoomId,
      activeRoomQuery.loading,
      clearQueue,
      createRoom,
      enqueueTrack,
      joinRoom,
      leaveRoom,
      moveQueueItem,
      pauseRoom,
      playRoom,
      removeQueueItem,
      repairSync,
      resolvedPlayback,
      resumeRoom,
      roomsQuery.data,
      roomsQuery.loading,
      selectActiveRoom,
      skipRoom,
      syncState,
    ],
  );

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error("useRooms must be used within a RoomsProvider.");
  }

  return context;
}

export function useOptionalRooms() {
  return useContext(RoomsContext);
}
