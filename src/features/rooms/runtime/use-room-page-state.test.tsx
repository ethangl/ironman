import { act, renderHook } from "@testing-library/react";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import type { RoomId } from "../client/room-types";
import { buildRoomPageHref, useRoomPageState } from "./use-room-page-state";

describe("buildRoomPageHref", () => {
  it("preserves unrelated query params while replacing roomId", () => {
    expect(buildRoomPageHref("/artist/artist-1", "?view=top", "room-2" as RoomId)).toBe(
      "/artist/artist-1?view=top&roomId=room-2",
    );
    expect(
      buildRoomPageHref(
        "/artist/artist-1",
        "?view=top&roomId=room-2",
        null,
      ),
    ).toBe("/artist/artist-1?view=top");
  });
});

describe("useRoomPageState", () => {
  it("reads roomId from the URL and updates it with push history", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const { result } = renderHook(() => useRoomPageState(), {
      wrapper: withNuqsTestingAdapter({
        hasMemory: true,
        onUrlUpdate,
        searchParams: "?artistId=artist-1&roomId=room-1",
      }),
    });

    expect(result.current.roomId).toBe("room-1");

    await act(async () => {
      await result.current.openRoom("room-2" as RoomId);
    });

    expect(result.current.roomId).toBe("room-2");
    expect(onUrlUpdate).toHaveBeenCalledTimes(1);
    expect(onUrlUpdate.mock.calls[0]?.[0].searchParams.get("artistId")).toBe(
      "artist-1",
    );
    expect(onUrlUpdate.mock.calls[0]?.[0].searchParams.get("roomId")).toBe(
      "room-2",
    );
    expect(onUrlUpdate.mock.calls[0]?.[0].options.history).toBe("push");

    await act(async () => {
      await result.current.closeRoom();
    });

    expect(result.current.roomId).toBeNull();
    expect(onUrlUpdate).toHaveBeenCalledTimes(2);
    expect(onUrlUpdate.mock.calls[1]?.[0].searchParams.get("artistId")).toBe(
      "artist-1",
    );
    expect(onUrlUpdate.mock.calls[1]?.[0].searchParams.get("roomId")).toBeNull();
    expect(onUrlUpdate.mock.calls[1]?.[0].options.history).toBe("push");
  });
});
