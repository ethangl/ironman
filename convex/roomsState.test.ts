import { describe, expect, it } from "vitest";

import {
  moveRoomQueueItemIds,
  resolveRoomPlaybackState,
  sortRoomQueueItems,
} from "../shared/rooms-state";

const queueItems = [
  { _id: "queue-2", position: 1, trackDurationMs: 90_000 },
  { _id: "queue-1", position: 0, trackDurationMs: 120_000 },
  { _id: "queue-3", position: 2, trackDurationMs: 60_000 },
] as const;

describe("roomsState", () => {
  it("sorts queue items by canonical position", () => {
    expect(sortRoomQueueItems(queueItems).map((queueItem) => queueItem._id)).toEqual([
      "queue-1",
      "queue-2",
      "queue-3",
    ]);
  });

  it("freezes paused playback at the stored room offset", () => {
    const resolved = resolveRoomPlaybackState(
      queueItems,
      {
        currentQueueItemId: "queue-1",
        startedAt: 5_000,
        startOffsetMs: 15_000,
        paused: true,
        pausedAt: 20_000,
      },
      60_000,
    );

    expect(resolved).toMatchObject({
      currentQueueItemId: "queue-1",
      currentOffsetMs: 30_000,
      paused: true,
      pausedAt: 20_000,
    });
  });

  it("advances the canonical room clock across queue items", () => {
    const resolved = resolveRoomPlaybackState(
      queueItems,
      {
        currentQueueItemId: "queue-1",
        startedAt: 0,
        startOffsetMs: 30_000,
        paused: false,
        pausedAt: null,
      },
      160_000,
    );

    expect(resolved).toMatchObject({
      currentQueueItemId: "queue-2",
      currentOffsetMs: 70_000,
      paused: false,
    });
  });

  it("pauses with no current item after the room queue is exhausted", () => {
    const resolved = resolveRoomPlaybackState(
      queueItems,
      {
        currentQueueItemId: "queue-1",
        startedAt: 0,
        startOffsetMs: 0,
        paused: false,
        pausedAt: null,
      },
      500_000,
    );

    expect(resolved).toMatchObject({
      currentQueueItemId: null,
      currentOffsetMs: 0,
      paused: true,
    });
  });

  it("moves queue items into a bounded target index", () => {
    expect(
      moveRoomQueueItemIds(
        ["queue-1", "queue-2", "queue-3"],
        "queue-3",
        10,
      ),
    ).toEqual(["queue-1", "queue-2", "queue-3"]);

    expect(
      moveRoomQueueItemIds(
        ["queue-1", "queue-2", "queue-3"],
        "queue-3",
        0,
      ),
    ).toEqual(["queue-3", "queue-1", "queue-2"]);
  });
});
