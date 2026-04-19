import { act, render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppRuntimeProvider } from "@/app";
import type { IronmanClient } from "@/features/ironman";
import { SpotifyActivityProvider } from "@/features/spotify/activity";
import {
  createSpotifyClient,
} from "@/features/spotify/client";
import { clearCachedSpotifyAccessToken } from "@/lib/spotify-access-token";
import { clearCachedSpotifyAccountLink } from "@/lib/spotify-account-link";
import { StreakData } from "@/types";
import { usePlayerQueueListing } from "./use-player-queue-listing";
import { useWebPlayerActions, useWebPlayerState } from "./use-web-player";
import { WebPlayerProvider } from "./web-player-provider";

const mockUseSession = vi.fn();
const mockGetAccessToken = vi.fn();
const mockAuthFetch = vi.fn();
const mockUseBrowserSearchParams = vi.fn();
const mockUseSpotify = vi.fn();
const mockSignOut = vi.fn();
const mockToastError = vi.fn();

vi.mock("@/hooks/use-browser-search-params", () => ({
  useBrowserSearchParams: () => mockUseBrowserSearchParams(),
}));

vi.mock("@/lib/convex-auth-client", () => ({
  useConvexSession: () => mockUseSession(),
  convexAuthClient: {
    $fetch: (...args: unknown[]) => mockAuthFetch(...args),
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  },
  convexSignIn: {
    social: vi.fn(),
  },
  convexSignOut: (...args: unknown[]) => ({ data: mockSignOut(...args) }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("../sdk/use-spotify", () => ({
  useSpotify: (...args: unknown[]) => mockUseSpotify(...args),
}));

vi.mock("@/features/reccobeats", () => ({
  useEnsureTrackAudioFeatures: vi.fn(),
}));

vi.mock("./mini-player", () => ({
  MiniPlayer: () => null,
}));

vi.mock("./standard-player", () => ({
  StandardPlayer: () => null,
}));

vi.mock("@/features/ironman", async () => {
  const actual =
    await vi.importActual<typeof import("@/features/ironman")>(
      "@/features/ironman",
    );
  return {
    ...actual,
    EnforcementEngine: () => null,
  };
});

class FakeBroadcastChannel {
  static channels = new Map<string, Set<FakeBroadcastChannel>>();

  listeners = new Set<(event: MessageEvent) => void>();
  closed = false;

  constructor(public readonly name: string) {
    const peers = FakeBroadcastChannel.channels.get(name) ?? new Set();
    peers.add(this);
    FakeBroadcastChannel.channels.set(name, peers);
  }

  addEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners.add(listener);
  }

  removeEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners.delete(listener);
  }

  postMessage(data: unknown) {
    const peers = FakeBroadcastChannel.channels.get(this.name) ?? new Set();
    for (const peer of peers) {
      if (peer === this || peer.closed) continue;
      peer.dispatch(data);
    }
  }

  dispatch(data: unknown) {
    const event = { data } as MessageEvent;
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  close() {
    this.closed = true;
    FakeBroadcastChannel.channels.get(this.name)?.delete(this);
  }

  static reset() {
    FakeBroadcastChannel.channels.clear();
  }
}

const baseSpotifyMock = {
  sdkState: null,
  init: vi.fn(),
  waitForReady: vi.fn().mockResolvedValue(null),
  play: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
  resume: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
  pause: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
  setVolume: vi.fn().mockResolvedValue(undefined),
  setRepeat: vi.fn().mockResolvedValue(undefined),
  getCurrentlyPlaying: vi
    .fn()
    .mockResolvedValue({ status: 204, playback: null }),
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function PlayerProbe() {
  const { streak, count, paused } = useWebPlayerState();
  return (
    <div>
      <div data-testid="track">{streak?.trackName ?? "none"}</div>
      <div data-testid="count">{String(count)}</div>
      <div data-testid="paused">{String(paused)}</div>
    </div>
  );
}

function PlayActionProbe({
  track,
}: {
  track: {
    id: string;
    name: string;
    artist: string;
    albumImage: string | null;
    durationMs: number;
  };
}) {
  const { playTrack } = useWebPlayerActions();
  return <button onClick={() => void playTrack(track)}>play-track</button>;
}

function SurrenderActionProbe() {
  const { surrender } = useWebPlayerActions();
  return <button onClick={() => void surrender()}>surrender</button>;
}

function PlayTracksActionProbe({
  startIndex = 0,
  tracks,
}: {
  startIndex?: number;
  tracks: {
    id: string;
    name: string;
    artist: string;
    albumImage: string | null;
    durationMs: number;
  }[];
}) {
  const { playTracks } = useWebPlayerActions();
  return (
    <button onClick={() => void playTracks(tracks, startIndex)}>
      play-tracks
    </button>
  );
}

function QueueListingProbe() {
  const { activeIndex, activeTrackId, hasTracks, items, playbackIndex } =
    usePlayerQueueListing();

  return (
    <div>
      <div data-testid="queue-listing-length">{String(items.length)}</div>
      <div data-testid="queue-listing-active-index">{String(activeIndex)}</div>
      <div data-testid="queue-listing-playback-index">
        {String(playbackIndex)}
      </div>
      <div data-testid="queue-listing-active-track">
        {activeTrackId ?? "none"}
      </div>
      <div data-testid="queue-listing-has-tracks">{String(hasTracks)}</div>
      <div data-testid="queue-listing-order">
        {items.map(({ track }) => track.id).join(",")}
      </div>
    </div>
  );
}

function renderProvider(children?: ReactNode) {
  return render(
    <AppRuntimeProvider
      spotifyClient={createSpotifyClient({
        spotifyActivity: {
          getFavoriteArtists: vi.fn().mockResolvedValue([]),
          getRecentlyPlayed: vi
            .fn()
            .mockResolvedValue({ items: [], rateLimited: false }),
          getPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
          getPlaylistTracks: vi.fn().mockResolvedValue([]),
          getTopArtists: vi.fn().mockResolvedValue([]),
        },
      })}
    >
      <SpotifyActivityProvider>
        <WebPlayerProvider>{children ?? <PlayerProbe />}</WebPlayerProvider>
      </SpotifyActivityProvider>
    </AppRuntimeProvider>,
  );
}

function createMockIronmanClient() {
  return {
    getStatus: vi.fn().mockResolvedValue(null),
    start: vi.fn(),
    activateHardcore: vi.fn(),
    surrender: vi.fn(),
    reportWeakness: vi.fn().mockResolvedValue(null),
    poll: vi.fn().mockResolvedValue({ count: 0 }),
  } satisfies IronmanClient;
}

function renderProviderWithClient(
  {
    spotifyClient,
    ironmanClient,
  }: {
    spotifyClient?: Parameters<typeof createSpotifyClient>[0];
    ironmanClient?: IronmanClient;
  },
  children?: ReactNode,
) {
  return render(
    <AppRuntimeProvider
      spotifyClient={createSpotifyClient({
        spotifyActivity: {
          getFavoriteArtists: vi.fn().mockResolvedValue([]),
          getRecentlyPlayed: vi
            .fn()
            .mockResolvedValue({ items: [], rateLimited: false }),
          getPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
          getPlaylistTracks: vi.fn().mockResolvedValue([]),
          getTopArtists: vi.fn().mockResolvedValue([]),
          ...spotifyClient?.spotifyActivity,
        },
        ...spotifyClient,
      })}
      ironmanClient={ironmanClient}
    >
      <SpotifyActivityProvider>
        <WebPlayerProvider>{children ?? <PlayerProbe />}</WebPlayerProvider>
      </SpotifyActivityProvider>
    </AppRuntimeProvider>,
  );
}

function buildStreak(overrides: Partial<StreakData> = {}): StreakData {
  return {
    id: "streak-1",
    trackId: "track-1",
    trackName: "Test Track",
    trackArtist: "Test Artist",
    trackImage: null,
    trackDuration: 123000,
    count: 7,
    active: true,
    hardcore: false,
    startedAt: "2026-04-07T00:00:00.000Z",
    ...overrides,
  };
}

describe("WebPlayerProvider", () => {
  beforeEach(() => {
    FakeBroadcastChannel.reset();
    vi.restoreAllMocks();
    clearCachedSpotifyAccountLink();
    clearCachedSpotifyAccessToken();
    mockToastError.mockReset();

    Object.defineProperty(window, "BroadcastChannel", {
      configurable: true,
      writable: true,
      value: FakeBroadcastChannel,
    });

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: { randomUUID: () => "self-tab" },
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
    });
    mockAuthFetch.mockResolvedValue([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);
    mockGetAccessToken.mockResolvedValue({ data: { accessToken: "token" } });
    mockUseBrowserSearchParams.mockReturnValue({
      get: () => null,
    });
    mockUseSpotify.mockReturnValue({
      ...baseSpotifyMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes streak status on mount, focus, and visible-tab transitions", async () => {
    const ironman = createMockIronmanClient();
    renderProviderWithClient({ ironmanClient: ironman });

    await waitFor(() => {
      expect(ironman.getStatus).toHaveBeenCalledTimes(1);
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(ironman.getStatus).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await waitFor(() => {
      expect(ironman.getStatus).toHaveBeenCalledTimes(2);
    });

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    await waitFor(() => {
      expect(ironman.getStatus).toHaveBeenCalledTimes(3);
    });
  });

  it("updates streak state from other tabs but ignores its own broadcasts", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("null", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("track")).toHaveTextContent("none");
    });

    const channel = new FakeBroadcastChannel("ironman-streak");

    act(() => {
      channel.postMessage({
        type: "streak_state",
        source: "other-tab",
        streak: buildStreak({ count: 11, trackName: "Remote Track" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("track")).toHaveTextContent("Remote Track");
    });
    expect(screen.getByTestId("count")).toHaveTextContent("11");

    act(() => {
      channel.postMessage({
        type: "streak_state",
        source: "self-tab",
        streak: buildStreak({ count: 99, trackName: "Should Ignore" }),
      });
    });

    expect(screen.getByTestId("track")).toHaveTextContent("Remote Track");
    expect(screen.getByTestId("count")).toHaveTextContent("11");
  });

  it("deduplicates same-track playback requests while a start is already in flight", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("null", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    let resolvePlay: ((value: { ok: boolean; status: number }) => void) | null =
      null;
    const playMock = vi.fn().mockImplementation(
      () =>
        new Promise<{ ok: boolean; status: number }>((resolve) => {
          resolvePlay = resolve;
        }),
    );

    mockUseSpotify.mockReturnValue({
      ...baseSpotifyMock,
      play: playMock,
    });

    renderProvider(
      <PlayActionProbe
        track={{
          id: "track-1",
          name: "Track One",
          artist: "Artist One",
          albumImage: null,
          durationMs: 123000,
        }}
      />,
    );

    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalled();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const button = screen.getByRole("button", { name: "play-track" });

    act(() => {
      button.click();
      button.click();
    });

    await waitFor(() => {
      expect(mockGetAccessToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(playMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      resolvePlay?.({ ok: true, status: 200 });
      await Promise.resolve();
    });

    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("exposes the current queue listing for multi-track playback", async () => {
    renderProvider(
      <>
        <QueueListingProbe />
        <PlayTracksActionProbe
          startIndex={1}
          tracks={[
            {
              id: "track-1",
              name: "Track One",
              artist: "Artist One",
              albumImage: null,
              durationMs: 123000,
            },
            {
              id: "track-2",
              name: "Track Two",
              artist: "Artist Two",
              albumImage: null,
              durationMs: 156000,
            },
          ]}
        />
      </>,
    );

    expect(screen.getByTestId("queue-listing-has-tracks")).toHaveTextContent(
      "false",
    );

    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalled();
    });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      screen.getByRole("button", { name: "play-tracks" }).click();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId("queue-listing-has-tracks")).toHaveTextContent(
        "true",
      );
    });

    expect(screen.getByTestId("queue-listing-length")).toHaveTextContent("2");
    expect(screen.getByTestId("queue-listing-order")).toHaveTextContent(
      "track-1,track-2",
    );
    expect(screen.getByTestId("queue-listing-active-track")).toHaveTextContent(
      "track-2",
    );
    expect(screen.getByTestId("queue-listing-active-index")).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId("queue-listing-playback-index"),
    ).toHaveTextContent("1");
  });

  it("clears the local streak immediately after surrender without waiting for repeat cleanup", async () => {
    const ironman = createMockIronmanClient();
    ironman.getStatus.mockResolvedValue(buildStreak());
    ironman.surrender.mockResolvedValue(undefined);

    const repeatDeferred = createDeferred<void>();
    mockUseSpotify.mockReturnValue({
      ...baseSpotifyMock,
      setRepeat: vi.fn().mockImplementation(() => repeatDeferred.promise),
    });

    renderProviderWithClient(
      { ironmanClient: ironman },
      <>
        <PlayerProbe />
        <SurrenderActionProbe />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("track")).toHaveTextContent("Test Track");
    });

    act(() => {
      screen.getByRole("button", { name: "surrender" }).click();
    });

    await waitFor(() => {
      expect(ironman.surrender).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("track")).toHaveTextContent("none");
    });

    repeatDeferred.resolve(undefined);
  });

  it("refreshes the cached Spotify token after the signed-in user changes", async () => {
    const { rerender } = renderProvider();

    const initialSpotifyArgs = mockUseSpotify.mock.calls.at(-1)?.[0] as {
      getAccessToken: () => Promise<string | null>;
      tokenRef: { current: string | null };
    };
    expect(initialSpotifyArgs).toBeDefined();

    await expect(initialSpotifyArgs.getAccessToken()).resolves.toBe("token");
    expect(initialSpotifyArgs.tokenRef.current).toBe("token");
    mockGetAccessToken.mockReset();
    mockGetAccessToken.mockResolvedValue({
      data: { accessToken: "token-2" },
    });

    mockUseSession.mockReturnValue({
      data: { user: { id: "user-2" } },
    });

    await act(async () => {
      rerender(
        <AppRuntimeProvider
          spotifyClient={createSpotifyClient({
          spotifyActivity: {
            getFavoriteArtists: vi.fn().mockResolvedValue([]),
              getRecentlyPlayed: vi
                .fn()
                .mockResolvedValue({ items: [], rateLimited: false }),
              getPlaylistsPage: vi.fn().mockResolvedValue({ items: [], total: 0 }),
              getPlaylistTracks: vi.fn().mockResolvedValue([]),
              getTopArtists: vi.fn().mockResolvedValue([]),
            },
          })}
        >
          <SpotifyActivityProvider>
            <WebPlayerProvider>
              <PlayerProbe />
            </WebPlayerProvider>
          </SpotifyActivityProvider>
        </AppRuntimeProvider>,
      );
      await Promise.resolve();
    });

    const nextSpotifyArgs = mockUseSpotify.mock.calls.at(-1)?.[0] as {
      getAccessToken: () => Promise<string | null>;
      tokenRef: { current: string | null };
    };
    expect(nextSpotifyArgs.tokenRef.current).toBeNull();

    await expect(nextSpotifyArgs.getAccessToken()).resolves.toBe("token-2");
    expect(nextSpotifyArgs.tokenRef.current).toBe("token-2");
    expect(mockGetAccessToken).toHaveBeenCalled();
  });

  it("shows an error when resume fallback playback fails on the SDK device", async () => {
    const ironman = createMockIronmanClient();
    ironman.getStatus.mockResolvedValue(buildStreak());

    mockUseSpotify.mockReturnValue({
      ...baseSpotifyMock,
      sdkState: {
        paused: true,
        position: 0,
        duration: 123000,
        trackId: "track-1",
      },
      resume: vi.fn().mockResolvedValue({ ok: false, status: 404 }),
      waitForReady: vi.fn().mockResolvedValue("device-1"),
      play: vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    });

    function TogglePlayProbe() {
      const { togglePlay } = useWebPlayerActions();
      return <button onClick={() => void togglePlay()}>toggle-play</button>;
    }

    renderProviderWithClient(
      { ironmanClient: ironman },
      <>
        <TogglePlayProbe />
        <PlayerProbe />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("track")).toHaveTextContent("Test Track");
    });

    await act(async () => {
      screen.getByRole("button", { name: "toggle-play" }).click();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Spotify is rate limiting playback right now. Please wait a bit and try again.",
      );
    });
  });
});
