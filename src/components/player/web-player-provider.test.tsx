import { ReactNode } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { useWebPlayerState } from "@/hooks/use-web-player";
import { useWebPlayerActions } from "@/hooks/use-web-player";
import { StreakData } from "@/types";
import { WebPlayerProvider } from "./web-player-provider";

const mockUseSession = vi.fn();
const mockGetAccessToken = vi.fn();
const mockUseSearchParams = vi.fn();
const mockUseSpotify = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: () => mockUseSession(),
  authClient: {
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  },
}));

vi.mock("@/hooks/use-spotify", () => ({
  useSpotify: (...args: unknown[]) => mockUseSpotify(...args),
}));

vi.mock("./mini-player", () => ({
  MiniPlayer: () => null,
}));

vi.mock("./standard-player", () => ({
  StandardPlayer: () => null,
}));

vi.mock("@/components/player/enforcement-engine", () => ({
  EnforcementEngine: () => null,
}));

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
  getCurrentlyPlaying: vi.fn().mockResolvedValue({ status: 204, playback: null }),
};

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

function PlayActionProbe({ track }: { track: { id: string; name: string; artist: string; albumImage: string | null; durationMs: number } }) {
  const { playTrack } = useWebPlayerActions();
  return (
    <button onClick={() => void playTrack(track)}>
      play-track
    </button>
  );
}

function renderProvider(children?: ReactNode) {
  return render(
    <WebPlayerProvider>{children ?? <PlayerProbe />}</WebPlayerProvider>,
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
    mockGetAccessToken.mockResolvedValue({ data: { accessToken: "token" } });
    mockUseSearchParams.mockReturnValue({
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
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response("null", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    renderProvider();

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/ironman/status");
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(3);
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

    const button = screen.getByRole("button", { name: "play-track" });

    act(() => {
      button.click();
      button.click();
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
});
