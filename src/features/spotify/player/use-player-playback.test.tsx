import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type { Track } from "@/types";
import type { PlayResult, SdkPlaybackState } from "@/types/spotify-playback";

import { usePlayerPlayback } from "./use-player-playback";

const mockToastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const trackA: Track = {
  id: "track-a",
  name: "Track A",
  artist: "Artist A",
  albumImage: null,
  durationMs: 180000,
};

const trackB: Track = {
  id: "track-b",
  name: "Track B",
  artist: "Artist B",
  albumImage: null,
  durationMs: 200000,
};

function createProps(overrides: Partial<UsePlayerPlaybackProps> = {}) {
  return {
    canControlPlayback: true,
    currentTrack: null,
    getAccessToken: vi.fn().mockResolvedValue("token"),
    initSpotify: vi.fn(),
    pause: vi.fn<() => Promise<PlayResult>>().mockResolvedValue({
      ok: true,
      status: 200,
    }),
    play: vi.fn<(uri: string, deviceId?: string) => Promise<PlayResult>>()
      .mockResolvedValue({
        ok: true,
        status: 200,
      }),
    progressMs: 0,
    resume: vi.fn<() => Promise<PlayResult>>().mockResolvedValue({
      ok: true,
      status: 200,
    }),
    sdkState: null as SdkPlaybackState | null,
    setCurrentTrack: vi.fn(),
    setSpotifyVolume: vi.fn().mockResolvedValue(undefined),
    waitForReady: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

type UsePlayerPlaybackProps = Parameters<typeof usePlayerPlayback>[0];

describe("usePlayerPlayback", () => {
  beforeEach(() => {
    mockToastError.mockReset();
  });

  it("does not keep a failed single-track start as the current track", async () => {
    const props = createProps({
      play: vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      }),
    });

    const { result } = renderHook(() => usePlayerPlayback(props));

    await act(async () => {
      await result.current.playTrack(trackA);
    });

    expect(props.setCurrentTrack).not.toHaveBeenCalled();
    expect(result.current.queue).toEqual([]);
    expect(result.current.hasQueue).toBe(false);
    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify is rate limiting playback right now. Please wait a bit and try again.",
    );
  });

  it("does not commit queue state when playlist playback fails to start", async () => {
    const props = createProps({
      play: vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      }),
    });

    const { result } = renderHook(() => usePlayerPlayback(props));

    await act(async () => {
      await result.current.playTracks([trackA, trackB], 1);
    });

    expect(props.setCurrentTrack).not.toHaveBeenCalled();
    expect(result.current.queue).toEqual([]);
    expect(result.current.queueIndex).toBe(0);
    expect(result.current.hasQueue).toBe(false);
    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify blocked this action. Premium or additional permissions may be required.",
    );
  });

  it("does not start playback when playback control is unavailable", async () => {
    const props = createProps({
      canControlPlayback: false,
    });

    const { result } = renderHook(() => usePlayerPlayback(props));

    await act(async () => {
      await result.current.playTracks([trackA, trackB], 1);
    });

    expect(props.play).not.toHaveBeenCalled();
    expect(props.setCurrentTrack).not.toHaveBeenCalled();
    expect(result.current.queue).toEqual([]);
    expect(result.current.queueIndex).toBe(0);
    expect(result.current.hasQueue).toBe(false);
  });

  it("swallows thrown resume failures and surfaces a toast instead", async () => {
    const props = createProps({
      resume: vi.fn().mockRejectedValue(new Error("resume failed")),
    });

    const { result } = renderHook(() => usePlayerPlayback(props));

    await act(async () => {
      await expect(result.current.togglePlay()).resolves.toBeUndefined();
    });

    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify could not complete that action right now.",
    );
  });

  it("swallows thrown pause failures and surfaces a toast instead", async () => {
    const props = createProps({
      pause: vi.fn().mockRejectedValue(new Error("pause failed")),
      sdkState: {
        duration: 180000,
        paused: false,
        position: 5000,
        trackId: trackA.id,
      },
    });

    const { result } = renderHook(() => usePlayerPlayback(props));

    await act(async () => {
      await expect(result.current.togglePlay()).resolves.toBeUndefined();
    });

    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify could not complete that action right now.",
    );
  });
});
