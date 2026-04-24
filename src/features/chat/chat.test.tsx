import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RoomActivityEvent, RoomId } from "../rooms/client/room-types";
import type { ResolvedRoomPlayback } from "../rooms/runtime/room-sync";
import { Chat } from "./chat";

const mocks = vi.hoisted(() => ({
  events: undefined as RoomActivityEvent[] | undefined,
  listActivityArgs: vi.fn(),
  recordCurrentTrackStarted: vi.fn(),
  roomDetails: {
    data: {},
    resolvedPlayback: null as ResolvedRoomPlayback | null,
  },
  sendChatMessage: vi.fn(),
}));

vi.mock("@api", () => ({
  api: {
    rooms: {
      listActivity: "rooms:listActivity",
      recordCurrentTrackStarted: "rooms:recordCurrentTrackStarted",
      sendChatMessage: "rooms:sendChatMessage",
    },
  },
}));

vi.mock("convex/react", () => ({
  useMutation: (functionReference: string) => {
    if (functionReference === "rooms:recordCurrentTrackStarted") {
      return mocks.recordCurrentTrackStarted;
    }
    if (functionReference === "rooms:sendChatMessage") {
      return mocks.sendChatMessage;
    }

    throw new Error(`Unexpected mutation reference: ${functionReference}`);
  },
  useQuery: (_functionReference: string, args: unknown) => {
    mocks.listActivityArgs(args);
    return mocks.events;
  },
}));

vi.mock("../rooms/client/room-hooks", () => ({
  useRoomDetails: () => mocks.roomDetails,
}));

vi.mock("./user-menu", () => ({
  UserMenu: () => null,
}));

const roomId = "room-1" as RoomId;

function createResolvedPlayback(
  input: Partial<ResolvedRoomPlayback>,
): ResolvedRoomPlayback {
  return {
    currentOffsetMs: 0,
    currentQueueItem: null,
    currentQueueItemId: null,
    paused: false,
    pausedAt: null,
    startedAt: null,
    startOffsetMs: 0,
    ...input,
  };
}

describe("Chat room activity", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    mocks.events = [];
    mocks.listActivityArgs.mockClear();
    mocks.recordCurrentTrackStarted.mockReset();
    mocks.recordCurrentTrackStarted.mockResolvedValue({});
    mocks.roomDetails = {
      data: {},
      resolvedPlayback: null,
    };
    mocks.sendChatMessage.mockReset();
    mocks.sendChatMessage.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("queries room activity after the sidebar join time", () => {
    mocks.events = [
      {
        _id: "activity-1",
        roomId,
        kind: "chat_message",
        createdAt: 1_100,
        actor: {
          userId: "user-1",
          name: "Ethan",
          image: null,
        },
        body: "hello room",
      } as RoomActivityEvent,
    ];

    render(<Chat roomId={roomId} />);

    expect(mocks.listActivityArgs).toHaveBeenCalledWith({
      roomId,
      since: 1_000,
      limit: 100,
    });
    expect(screen.getByText("hello room")).toBeInTheDocument();
  });

  it("sends trimmed chat messages from the sidebar child", async () => {
    render(<Chat roomId={roomId} />);

    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "  hey there  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(mocks.sendChatMessage).toHaveBeenCalledWith({
        roomId,
        body: "hey there",
      });
    });
  });

  it("records only tracks that become current after joining", async () => {
    mocks.roomDetails = {
      data: {},
      resolvedPlayback: createResolvedPlayback({
        currentQueueItemId: "queue-before" as never,
        startedAt: 900,
      }),
    };

    const { rerender } = render(<Chat roomId={roomId} />);

    expect(mocks.recordCurrentTrackStarted).not.toHaveBeenCalled();

    mocks.roomDetails = {
      data: {},
      resolvedPlayback: createResolvedPlayback({
        currentQueueItemId: "queue-after" as never,
        startedAt: 1_200,
      }),
    };
    rerender(<Chat roomId={roomId} />);

    await waitFor(() => {
      expect(mocks.recordCurrentTrackStarted).toHaveBeenCalledWith({
        roomId,
        queueItemId: "queue-after",
      });
    });
  });
});
