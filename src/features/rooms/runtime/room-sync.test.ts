import { describe, expect, it } from "vitest";

import type { RoomDetails } from "../client/room-types";
import { getRoomSyncState, resolveRoomPlayback } from "./room-sync";

const roomDetails: RoomDetails = {
  room: {
    _id: "room-1" as never,
    slug: "midnight-room",
    name: "Midnight Room",
    description: "Late-night queue",
    visibility: "public",
    ownerUserId: "user-1",
    createdAt: 1_000,
    archivedAt: null,
  },
  viewerFollowsRoom: false,
  viewerMembership: {
    _id: "membership-1",
    role: "member",
    active: true,
    joinedAt: 1_000,
    leftAt: null,
  },
  memberCount: 2,
  presentCount: 1,
  presentUsers: [
    {
      userId: "user-1",
      name: "User One",
      image: null,
    },
  ],
  roleHolders: [
    {
      userId: "user-1",
      name: "User One",
      image: null,
      role: "member",
    },
    {
      userId: "user-2",
      name: "User Two",
      image: null,
      role: "moderator",
    },
  ],
  queueLength: 2,
  queue: [
    {
      _id: "queue-1" as never,
      roomId: "room-1" as never,
      position: 0,
      trackId: "track-1",
      trackName: "Track One",
      trackArtists: ["Artist One"],
      trackImageUrl: null,
      trackDurationMs: 180_000,
      addedByUserId: "user-1",
      addedAt: 1_000,
    },
    {
      _id: "queue-2" as never,
      roomId: "room-1" as never,
      position: 1,
      trackId: "track-2",
      trackName: "Track Two",
      trackArtists: ["Artist Two"],
      trackImageUrl: null,
      trackDurationMs: 180_000,
      addedByUserId: "user-2",
      addedAt: 2_000,
    },
  ],
  playback: {
    currentQueueItemId: "queue-1" as never,
    currentQueueItem: {
      _id: "queue-1" as never,
      roomId: "room-1" as never,
      position: 0,
      trackId: "track-1",
      trackName: "Track One",
      trackArtists: ["Artist One"],
      trackImageUrl: null,
      trackDurationMs: 180_000,
      addedByUserId: "user-1",
      addedAt: 1_000,
    },
    startedAt: 10_000,
    startOffsetMs: 0,
    paused: false,
    pausedAt: null,
    updatedAt: 10_000,
    canEnqueue: true,
    canManageQueue: false,
    canControlPlayback: false,
  },
};

describe("room-sync", () => {
  it("resolves the canonical room playback against the wall clock", () => {
    const resolvedPlayback = resolveRoomPlayback(roomDetails, 40_000);

    expect(resolvedPlayback).toMatchObject({
      currentQueueItemId: "queue-1",
      currentOffsetMs: 30_000,
    });
  });

  it("reports the room as live when playback is active", () => {
    const resolvedPlayback = resolveRoomPlayback(roomDetails, 41_000);

    expect(
      getRoomSyncState({
        hasActiveRoom: true,
        resolvedPlayback,
      }),
    ).toMatchObject({
      code: "synced",
      label: "Following room",
    });
  });

  it("does not treat later local divergence as a room runtime problem", () => {
    const resolvedPlayback = resolveRoomPlayback(roomDetails, 41_000);

    expect(
      getRoomSyncState({
        hasActiveRoom: true,
        resolvedPlayback,
      }),
    ).toMatchObject({
      code: "synced",
      label: "Following room",
    });
  });

  it("resolves the current track even when the queue only contains up-next songs", () => {
    const separatedCurrentRoomDetails: RoomDetails = {
      ...roomDetails,
      queueLength: 1,
      queue: [roomDetails.queue[1]!],
      playback: {
        ...roomDetails.playback,
        currentQueueItem: roomDetails.queue[0]!,
        currentQueueItemId: roomDetails.queue[0]!._id,
      },
    };

    const resolvedPlayback = resolveRoomPlayback(
      separatedCurrentRoomDetails,
      40_000,
    );

    expect(resolvedPlayback).toMatchObject({
      currentQueueItemId: "queue-1",
      currentOffsetMs: 30_000,
    });
    expect(resolvedPlayback?.currentQueueItem?.trackId).toBe("track-1");
  });

  it("does not invent a current track before room playback starts", () => {
    const queuedRoomDetails: RoomDetails = {
      ...roomDetails,
      playback: {
        ...roomDetails.playback,
        currentQueueItemId: null,
        currentQueueItem: null,
        startedAt: null,
        startOffsetMs: 0,
        paused: true,
        pausedAt: 10_000,
      },
    };

    const resolvedPlayback = resolveRoomPlayback(queuedRoomDetails, 40_000);

    expect(resolvedPlayback).toMatchObject({
      currentQueueItem: null,
      currentQueueItemId: null,
      currentOffsetMs: 0,
      paused: true,
    });
  });
});
