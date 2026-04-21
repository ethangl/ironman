import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RoomDetails } from "../client/room-types";
import { resolveRoomPlayback } from "./room-sync";
import { useRoomSyncController } from "./use-room-sync-controller";

const syncTrack = vi.fn<(track: { id: string }, offsetMs?: number) => Promise<void>>();
const togglePlay = vi.fn<() => Promise<void>>();

let mockSdkState:
  | {
      duration: number;
      paused: boolean;
      position: number;
      trackId: string;
    }
  | null = null;

vi.mock("@/features/spotify-player", () => ({
  useWebPlayerActions: () => ({
    syncTrack,
    togglePlay,
  }),
  useWebPlayerState: () => ({
    sdkState: mockSdkState,
  }),
}));

function createRoomDetails(): RoomDetails {
  return {
    room: {
      _id: "room-1" as never,
      slug: "night-shift",
      name: "Night Shift",
      description: "After-hours queue",
      visibility: "public",
      ownerUserId: "user-1",
      createdAt: 1_000,
      archivedAt: null,
    },
    viewerMembership: {
      _id: "membership-1",
      role: "member",
      active: true,
      joinedAt: 1_000,
      leftAt: null,
    },
    memberCount: 2,
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
      room: {
        _id: "room-1" as never,
        slug: "night-shift",
        name: "Night Shift",
        description: "After-hours queue",
        visibility: "public",
        ownerUserId: "user-1",
        createdAt: 1_000,
        archivedAt: null,
      },
      viewerMembership: {
        _id: "membership-1",
        role: "member",
        active: true,
        joinedAt: 1_000,
        leftAt: null,
      },
      memberCount: 2,
      queueLength: 2,
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
      expectedOffsetMs: 30_000,
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
}

describe("useRoomSyncController", () => {
  beforeEach(() => {
    syncTrack.mockReset();
    syncTrack.mockResolvedValue(undefined);
    togglePlay.mockReset();
    togglePlay.mockResolvedValue(undefined);
    mockSdkState = {
      duration: 180_000,
      paused: false,
      position: 30_000,
      trackId: "track-1",
    };
  });

  it("stops following room updates until the listener explicitly syncs again", async () => {
    const initialRoom = createRoomDetails();
    const nextRoom = {
      ...createRoomDetails(),
      playback: {
        ...createRoomDetails().playback,
        currentQueueItemId: "queue-2" as never,
        currentQueueItem: {
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
        expectedOffsetMs: 15_000,
        startedAt: 205_000,
        updatedAt: 205_000,
      },
    };

    const { result, rerender } = renderHook(
      ({ activeRoom, resolvedPlayback }) =>
        useRoomSyncController({
          activeRoom,
          resolvedPlayback,
        }),
      {
        initialProps: {
          activeRoom: initialRoom,
          resolvedPlayback: resolveRoomPlayback(initialRoom, 40_000),
        },
      },
    );

    await waitFor(() => {
      expect(syncTrack).toHaveBeenCalledWith(
        expect.objectContaining({ id: "track-1" }),
        30_000,
      );
    });

    syncTrack.mockClear();

    await act(async () => {
      await result.current.stopListening();
    });

    expect(result.current.isListeningToRoom).toBe(false);
    expect(result.current.syncState).toMatchObject({
      code: "detached",
      label: "Stopped listening",
    });
    expect(togglePlay).toHaveBeenCalledTimes(1);

    rerender({
      activeRoom: nextRoom,
      resolvedPlayback: resolveRoomPlayback(nextRoom, 220_000),
    });

    await waitFor(() => {
      expect(result.current.syncState.code).toBe("detached");
    });

    expect(syncTrack).not.toHaveBeenCalled();

    act(() => {
      result.current.repairSync();
    });

    await waitFor(() => {
      expect(syncTrack).toHaveBeenCalledWith(
        expect.objectContaining({ id: "track-2" }),
        15_000,
      );
    });

    expect(result.current.isListeningToRoom).toBe(true);
  });
});
