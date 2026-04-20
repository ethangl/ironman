import { createContext, useContext } from "react";

import type { SpotifyTrack } from "@/types";
import type {
  RoomDetails,
  RoomId,
  RoomQueueItemId,
  RoomSummary,
  RoomSyncState,
} from "../client/room-types";
import type { ResolvedRoomPlayback } from "./room-sync";

export interface RoomsContextValue {
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

export const RoomsContext = createContext<RoomsContextValue | null>(null);

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
