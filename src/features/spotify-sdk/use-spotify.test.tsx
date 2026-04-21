import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { spotifyPlaybackClient } from "@/features/spotify-client";
import { useSpotify } from "./use-spotify";

type ListenerMap = Record<string, (data?: unknown) => void>;

class FakeSpotifyPlayer {
  static instances: FakeSpotifyPlayer[] = [];
  static connectResults: Array<boolean | Error> = [];

  listeners: ListenerMap = {};
  getOAuthToken?: (cb: (token: string) => void) => void;
  disconnect = vi.fn();
  activateElement = vi.fn();
  togglePlay = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn().mockResolvedValue(undefined);
  setVolume = vi.fn().mockResolvedValue(undefined);
  getCurrentState = vi.fn().mockResolvedValue(null);

  constructor(options?: { getOAuthToken?: (cb: (token: string) => void) => void }) {
    this.getOAuthToken = options?.getOAuthToken;
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
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("resolves all pending waiters when the SDK becomes ready", async () => {
    const tokenRef = { current: "token" };
    const { result } = renderHook(() =>
      useSpotify({
        getAccessToken: vi.fn().mockResolvedValue("token"),
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
        getAccessToken: vi.fn().mockResolvedValue("token"),
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
        getAccessToken: vi.fn().mockResolvedValue("token"),
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
        getAccessToken: vi.fn().mockResolvedValue("token"),
        tokenRef,
        trackId: "track-1",
      }),
    );

    await expect(result.current.pause()).resolves.toEqual({
      ok: false,
      status: 429,
    });
  });

  it("clears a queued sdk init when the hook unmounts before the sdk loads", () => {
    Object.defineProperty(window, "Spotify", {
      configurable: true,
      value: undefined,
    });

    const tokenRef = { current: "token" };
    const { result, unmount } = renderHook(() =>
      useSpotify({
        getAccessToken: vi.fn().mockResolvedValue("token"),
        tokenRef,
        trackId: "track-1",
      }),
    );

    act(() => {
      result.current.init();
    });

    unmount();

    Object.defineProperty(window, "Spotify", {
      configurable: true,
      value: { Player: FakeSpotifyPlayer },
    });

    act(() => {
      window.onSpotifyWebPlaybackSDKReady();
    });

    expect(FakeSpotifyPlayer.instances).toHaveLength(0);
  });

  it("rejects repeat updates when spotify does not accept the request", async () => {
    vi.spyOn(spotifyPlaybackClient, "setRepeat").mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    const tokenRef = { current: "token" };
    const { result } = renderHook(() =>
      useSpotify({
        getAccessToken: vi.fn().mockResolvedValue("token"),
        tokenRef,
        trackId: "track-1",
      }),
    );

    await expect(result.current.setRepeat("track")).rejects.toThrow(
      "Spotify repeat update failed with status 429",
    );
  });

  it("refreshes the SDK token through the access-token getter", async () => {
    const getAccessToken = vi
      .fn()
      .mockResolvedValueOnce("fresh-token-1")
      .mockResolvedValueOnce("fresh-token-2");
    const tokenRef = { current: "stale-token" };

    const { result } = renderHook(() =>
      useSpotify({
        getAccessToken,
        tokenRef,
        trackId: "track-1",
      }),
    );

    act(() => {
      result.current.init();
    });

    const player = FakeSpotifyPlayer.instances[0];
    expect(player.getOAuthToken).toBeDefined();

    const tokenA = new Promise<string>((resolve) => {
      player.getOAuthToken?.(resolve);
    });
    const tokenB = new Promise<string>((resolve) => {
      player.getOAuthToken?.(resolve);
    });

    await expect(tokenA).resolves.toBe("fresh-token-1");
    await expect(tokenB).resolves.toBe("fresh-token-2");
    expect(tokenRef.current).toBe("fresh-token-2");
    expect(getAccessToken).toHaveBeenCalledTimes(2);
  });

  it("keeps polling after a transient getCurrentState failure", async () => {
    const tokenRef = { current: "token" };
    const getAccessToken = vi.fn().mockResolvedValue("token");
    const { result } = renderHook(() =>
      useSpotify({
        getAccessToken,
        tokenRef,
        trackId: "track-1",
      }),
    );

    act(() => {
      result.current.init();
    });

    const player = FakeSpotifyPlayer.instances[0];
    player.getCurrentState
      .mockRejectedValueOnce(new Error("temporary sdk failure"))
      .mockResolvedValueOnce({
        position: 1500,
        duration: 123000,
        paused: false,
        track_window: { current_track: { id: "track-1" } },
      });

    act(() => {
      player.emit("player_state_changed", {
        position: 0,
        duration: 123000,
        paused: false,
        track_window: { current_track: { id: "track-1" } },
      });
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(player.getCurrentState).toHaveBeenCalledTimes(2);
    expect(result.current.sdkState).toMatchObject({
      position: 1500,
      duration: 123000,
      paused: false,
      trackId: "track-1",
    });
  });

  it("stops polling when the sdk reports no active state", async () => {
    const tokenRef = { current: "token" };
    const { result } = renderHook(() =>
      useSpotify({
        getAccessToken: vi.fn().mockResolvedValue("token"),
        tokenRef,
        trackId: "track-1",
      }),
    );

    act(() => {
      result.current.init();
    });

    const player = FakeSpotifyPlayer.instances[0];

    act(() => {
      player.emit("player_state_changed", {
        position: 0,
        duration: 123000,
        paused: false,
        track_window: { current_track: { id: "track-1" } },
      });
      player.emit("player_state_changed", null);
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(player.getCurrentState).not.toHaveBeenCalled();
  });
});
