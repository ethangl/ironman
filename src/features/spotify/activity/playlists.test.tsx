import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SpotifyClient } from "@/features/spotify/client";
import {
  SpotifyClientProvider,
  createSpotifyClient,
} from "@/features/spotify/client";
import {
  RoomsContext,
  type RoomsContextValue,
} from "@/features/rooms/runtime/rooms-context";
import { Playlists } from "./playlists";

const mockPlayTracks = vi.fn();
const mockToastError = vi.fn();
const mockEnqueueTracks = vi.fn();
const mockGetPlaylistTracks = vi.fn();

vi.mock("@/features/spotify/player", () => ({
  useWebPlayerActions: () => ({
    playTracks: (...args: unknown[]) => mockPlayTracks(...args),
  }),
}));

vi.mock("@/components/play-button", () => ({
  PlayButton: ({
    disabled,
    onClick,
  }: {
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      Play
    </button>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

function createRoomsValue(
  overrides: Partial<RoomsContextValue> = {},
): RoomsContextValue {
  return {
    activeRoom: {
      room: {
        _id: "room-1" as never,
        slug: "night-shift",
        name: "Night Shift",
        description: null,
        visibility: "public",
        ownerUserId: "user-1",
        createdAt: 1,
        archivedAt: null,
      },
      viewerMembership: {
        _id: "membership-1",
        role: "member",
        active: true,
        joinedAt: 1,
        leftAt: null,
      },
      memberCount: 2,
      queueLength: 0,
      queue: [],
      playback: {
        room: {
          _id: "room-1" as never,
          slug: "night-shift",
          name: "Night Shift",
          description: null,
          visibility: "public",
          ownerUserId: "user-1",
          createdAt: 1,
          archivedAt: null,
        },
        viewerMembership: {
          _id: "membership-1",
          role: "member",
          active: true,
          joinedAt: 1,
          leftAt: null,
        },
        memberCount: 2,
        queueLength: 0,
        currentQueueItemId: null,
        currentQueueItem: null,
        expectedOffsetMs: 0,
        startedAt: null,
        startOffsetMs: 0,
        paused: true,
        pausedAt: null,
        updatedAt: 1,
        canEnqueue: true,
        canManageQueue: false,
        canControlPlayback: false,
      },
    },
    activeRoomId: "room-1" as never,
    activeRoomLoading: false,
    clearQueue: vi.fn(),
    createRoom: vi.fn(),
    enqueueTrack: vi.fn(),
    enqueueTracks: (...args: unknown[]) => mockEnqueueTracks(...args),
    isListeningToRoom: false,
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    moveQueueItem: vi.fn(),
    removeQueueItem: vi.fn(),
    repairSync: vi.fn(),
    resolvedPlayback: null,
    rooms: [],
    roomsLoading: false,
    selectActiveRoom: vi.fn(),
    skipRoom: vi.fn(),
    stopListening: vi.fn(),
    syncState: {
      code: "idle",
      label: "Idle",
      driftMs: null,
    },
    ...overrides,
  };
}

function renderPlaylists(options?: {
  rooms?: Partial<RoomsContextValue> | null;
  spotifyClient?: Parameters<typeof createSpotifyClient>[0];
}) {
  const client = createSpotifyClient({
    spotifyActivity: {
      getFavoriteArtists: vi.fn().mockResolvedValue([]),
      getRecentlyPlayed: vi
        .fn()
        .mockResolvedValue({ items: [], rateLimited: false }),
      getPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      getPlaylistTracks: (...args: unknown[]) => mockGetPlaylistTracks(...args),
      getTopArtists: vi.fn().mockResolvedValue([]),
      ...options?.spotifyClient?.spotifyActivity,
    } satisfies Partial<SpotifyClient["spotifyActivity"]>,
    ...options?.spotifyClient,
  });

  const content = (
    <SpotifyClientProvider client={client}>
      <Playlists
        title="Your Playlists"
        playlists={[
          {
            id: "playlist-1",
            name: "Heavy Rotation",
            description: null,
            image: "playlist.jpg",
            owner: "ethan",
            public: true,
            trackCount: 12,
          },
        ]}
      />
    </SpotifyClientProvider>
  );

  if (options?.rooms === null) {
    return render(content);
  }

  return render(
    <RoomsContext.Provider value={createRoomsValue(options?.rooms ?? {})}>
      {content}
    </RoomsContext.Provider>,
  );
}

describe("Playlists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPlaylistTracks.mockResolvedValue([
      {
        id: "track-1",
        name: "Weight",
        artist: "ISIS",
        albumImage: "track.jpg",
        durationMs: 640_000,
      },
    ]);
  });

  it("queues playlist tracks into the active room", async () => {
    renderPlaylists();

    fireEvent.click(
      screen.getByRole("button", { name: "Queue Heavy Rotation" }),
    );

    await waitFor(() => {
      expect(mockGetPlaylistTracks).toHaveBeenCalledWith("playlist-1");
    });
    await waitFor(() => {
      expect(mockEnqueueTracks).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "track-1",
          name: "Weight",
        }),
      ]);
    });
  });

  it("reuses cached playlist tracks on repeated queue actions", async () => {
    renderPlaylists();

    const button = screen.getByRole("button", { name: "Queue Heavy Rotation" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockEnqueueTracks).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockEnqueueTracks).toHaveBeenCalledTimes(2);
    });
    expect(mockGetPlaylistTracks).toHaveBeenCalledTimes(1);
  });

  it("hides the queue button when there is no enqueueable active room", () => {
    renderPlaylists({
      rooms: {
        activeRoom: null,
        activeRoomId: null,
      },
    });

    expect(
      screen.queryByRole("button", { name: "Queue Heavy Rotation" }),
    ).not.toBeInTheDocument();
  });
});
