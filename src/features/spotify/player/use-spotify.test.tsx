import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { spotifyPlaybackClient } from "@/features/spotify/client";
import { useSpotify } from "./use-spotify";

type ListenerMap = Record<string, (data?: unknown) => void>;

class FakeSpotifyPlayer {
  static instances: FakeSpotifyPlayer[] = [];
  static connectResults: Array<boolean | Error> = [];

  listeners: ListenerMap = {};
  disconnect = vi.fn();
  activateElement = vi.fn();
  togglePlay = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn().mockResolvedValue(undefined);
  setVolume = vi.fn().mockResolvedValue(undefined);
  getCurrentState = vi.fn().mockResolvedValue(null);

  constructor() {
    FakeSpotifyPlayer.instances.push(this);
  }

  connect = vi.fn().mockImplementation(async () => {
    const next = FakeSpotifyPlayer.connectResults.shift() ?? true;
    if (next instanceof Error) throw next;
    return next;
  });

  addListener(event: string, callback: (data?: unknown) => void) {
    this.listeners[event] = callback;
  }

  emit(event: string, data?: unknown) {
    this.listeners[event]?.(data);
  }

  static reset() {
    FakeSpotifyPlayer.instances = [];
    FakeSpotifyPlayer.connectResults = [];
  }
}

describe("useSpotify", () => {
  beforeEach(() => {
    FakeSpotifyPlayer.reset();
    vi.restoreAllMocks();
    Object.defineProperty(window, "Spotify", {
      configurable: true,
      value: { Player: FakeSpotifyPlayer },
    });
    vi.spyOn(spotifyPlaybackClient, "pause").mockResolvedValue({
      ok: false,
      status: 429,
    });
    vi.spyOn(spotifyPlaybackClient, "play").mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.spyOn(spotifyPlaybackClient, "resume").mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.spyOn(spotifyPlaybackClient, "setRepeat").mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.spyOn(spotifyPlaybackClient, "setVolume").mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.spyOn(spotifyPlaybackClient, "getCurrentlyPlaying").mockResolvedValue({
      status: 204,
      playback: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves all pending waiters when the SDK becomes ready", async () => {
    const tokenRef = { current: "token" };
    const { result } = renderHook(() =>
      useSpotify({
        tokenRef,
        trackId: "track-1",
      }),
    );

    act(() => {
      result.current.init();
    });

    const waitA = result.current.waitForReady();
    const waitB = result.current.waitForReady();

    act(() => {
      FakeSpotifyPlayer.instances[0].emit("ready", { device_id: "device-1" });
    });

    await expect(waitA).resolves.toBe("device-1");
    await expect(waitB).resolves.toBe("device-1");
  });

  it("cleans up after a failed connect so init can retry", async () => {
    FakeSpotifyPlayer.connectResults = [false, true];

    const tokenRef = { current: "token" };
    const { result } = renderHook(() =>
      useSpotify({
        tokenRef,
        trackId: "track-1",
      }),
    );

    act(() => {
      result.current.init();
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(FakeSpotifyPlayer.instances).toHaveLength(1);
    expect(FakeSpotifyPlayer.instances[0].disconnect).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.init();
    });

    expect(FakeSpotifyPlayer.instances).toHaveLength(2);
  });

  it("does not reuse a stale device id after not_ready", async () => {
    const tokenRef = { current: "token" };
    const { result } = renderHook(() =>
      useSpotify({
        tokenRef,
        trackId: "track-1",
      }),
    );

    act(() => {
      result.current.init();
      FakeSpotifyPlayer.instances[0].emit("ready", { device_id: "device-1" });
    });

    await expect(result.current.waitForReady()).resolves.toBe("device-1");

    act(() => {
      FakeSpotifyPlayer.instances[0].emit("not_ready");
    });

    let resolved = false;
    const pending = result.current.waitForReady().then((value) => {
      resolved = true;
      return value;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);

    act(() => {
      FakeSpotifyPlayer.instances[0].emit("ready", { device_id: "device-2" });
    });

    await expect(pending).resolves.toBe("device-2");
  });

  it("reports pause failures instead of treating them as success", async () => {
    const tokenRef = { current: "token" };
    const { result } = renderHook(() =>
      useSpotify({
        tokenRef,
        trackId: "track-1",
      }),
    );

    await expect(result.current.pause()).resolves.toEqual({
      ok: false,
      status: 429,
    });
  });
});
