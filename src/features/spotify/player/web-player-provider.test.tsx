import { act, render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppRuntimeProvider } from "@/app";
import { SpotifyActivityProvider } from "@/features/spotify/activity";
import { createSpotifyClient } from "@/features/spotify/client";
import { clearCachedSpotifyAccessToken } from "@/lib/spotify-access-token";
import { clearCachedSpotifyAccountLink } from "@/lib/spotify-account-link";
import { usePlayerQueueListing } from "./use-player-queue-listing";
import { useWebPlayerActions, useWebPlayerState } from "./use-web-player";
import { WebPlayerProvider } from "./web-player-provider";

const mockUseSession = vi.fn();
const mockGetAccessToken = vi.fn();
const mockAuthFetch = vi.fn();
const mockSignOut = vi.fn();
const mockUseSpotify = vi.fn();
const mockToastError = vi.fn();

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

vi.mock("./mini-player", () => ({
  MiniPlayer: () => null,
}));

vi.mock("./standard-player", () => ({
  StandardPlayer: () => null,
}));

const baseSpotifyMock = {
  sdkState: null,
  init: vi.fn(),
  waitForReady: vi.fn().mockResolvedValue(null),
  play: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
  resume: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
  pause: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
  setVolume: vi.fn().mockResolvedValue(undefined),
  setRepeat: vi.fn().mockResolvedValue(undefined),
};

function PlayerProbe() {
  const { currentTrack, paused } = useWebPlayerState();
  return (
    <div>
      <div data-testid="track">{currentTrack?.name ?? "none"}</div>
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

function TogglePlayProbe() {
  const { togglePlay } = useWebPlayerActions();
  return <button onClick={() => void togglePlay()}>toggle-play</button>;
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

function renderProvider(
  spotifyClient?: Parameters<typeof createSpotifyClient>[0],
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
    >
      <SpotifyActivityProvider>
        <WebPlayerProvider>{children ?? <PlayerProbe />}</WebPlayerProvider>
      </SpotifyActivityProvider>
    </AppRuntimeProvider>,
  );
}

describe("WebPlayerProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCachedSpotifyAccountLink();
    clearCachedSpotifyAccessToken();
    mockToastError.mockReset();

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
    mockUseSpotify.mockReturnValue({
      ...baseSpotifyMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tracks the current track after a successful play request", async () => {
    renderProvider(
      undefined,
      <>
        <PlayerProbe />
        <PlayActionProbe
          track={{
            id: "track-1",
            name: "Track One",
            artist: "Artist One",
            albumImage: null,
            durationMs: 123000,
          }}
        />
      </>,
    );

    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalled();
    });

    await act(async () => {
      screen.getByRole("button", { name: "play-track" }).click();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId("track")).toHaveTextContent("Track One");
    });
  });

  it("deduplicates same-track playback requests while a start is already in flight", async () => {
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
      undefined,
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
      undefined,
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
              getPlaylistsPage: vi
                .fn()
                .mockResolvedValue({ items: [], total: 0 }),
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
    const playMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({ ok: false, status: 429 });

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
      play: playMock,
    });

    renderProvider(
      undefined,
      <>
        <PlayerProbe />
        <PlayActionProbe
          track={{
            id: "track-1",
            name: "Track One",
            artist: "Artist One",
            albumImage: null,
            durationMs: 123000,
          }}
        />
        <TogglePlayProbe />
      </>,
    );

    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalled();
    });

    await act(async () => {
      screen.getByRole("button", { name: "play-track" }).click();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId("track")).toHaveTextContent("Track One");
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
