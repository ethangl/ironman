import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    Object.defineProperty(window, "Spotify", {
      configurable: true,
      value: { Player: FakeSpotifyPlayer },
    });
  });

  afterEach(() => {
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
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 429 }),
    );

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
});
