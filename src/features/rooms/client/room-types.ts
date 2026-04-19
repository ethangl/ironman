import type { Id } from "../../../../convex/_generated/dataModel";

export type RoomId = Id<"rooms">;
export type RoomQueueItemId = Id<"roomQueueItems">;

export type RoomVisibility = "public" | "private";
export type RoomRole = "owner" | "moderator" | "member";

export interface RoomSnapshot {
  _id: RoomId;
  slug: string;
  name: string;
  description: string | null;
  visibility: RoomVisibility;
  ownerUserId: string;
  createdAt: number;
  archivedAt: number | null;
}

export interface RoomMembershipSnapshot {
  _id: string;
  role: RoomRole;
  active: boolean;
  joinedAt: number;
  leftAt: number | null;
}

export interface RoomQueueItem {
  _id: RoomQueueItemId;
  roomId: RoomId;
  position: number;
  trackId: string;
  trackName: string;
  trackArtists: string[];
  trackImageUrl: string | null;
  trackDurationMs: number;
  addedByUserId: string;
  addedAt: number;
}

export interface RoomSummary {
  room: RoomSnapshot;
  viewerMembership: RoomMembershipSnapshot | null;
}

export interface RoomPlaybackSnapshot {
  room: RoomSnapshot;
  viewerMembership: RoomMembershipSnapshot | null;
  memberCount: number;
  queueLength: number;
  currentQueueItemId: RoomQueueItemId | null;
  currentQueueItem: RoomQueueItem | null;
  expectedOffsetMs: number;
  startedAt: number | null;
  startOffsetMs: number;
  paused: boolean;
  pausedAt: number | null;
  updatedAt: number;
  canEnqueue: boolean;
  canManageQueue: boolean;
  canControlPlayback: boolean;
}

export interface RoomDetails {
  room: RoomSnapshot;
  viewerMembership: RoomMembershipSnapshot | null;
  memberCount: number;
  queueLength: number;
  queue: RoomQueueItem[];
  playback: RoomPlaybackSnapshot;
}

export type RoomSyncCode =
  | "idle"
  | "queue_empty"
  | "paused"
  | "syncing"
  | "synced";

export interface RoomSyncState {
  code: RoomSyncCode;
  label: string;
  driftMs: number | null;
}
