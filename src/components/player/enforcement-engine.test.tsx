import { render, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StreakData } from "@/types";
import { EnforcementEngine } from "./enforcement-engine";

function buildStreak(overrides: Partial<StreakData> = {}): StreakData {
  return {
    id: "streak-1",
    trackId: "track-1",
    trackName: "Track One",
    trackArtist: "Artist One",
    trackImage: null,
    trackDuration: 123000,
    count: 5,
    active: true,
    hardcore: false,
    startedAt: "2026-04-07T00:00:00.000Z",
    ...overrides,
  };
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: state,
  });
}

async function flushAsyncWork() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("EnforcementEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    localStorage.clear();
    setVisibility("visible");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls as the visible leader, pauses while hidden, and resumes on visibility return", async () => {
    const getCurrentlyPlaying = vi
      .fn()
      .mockResolvedValue({ status: 401, playback: null });

    render(
      <EnforcementEngine
        streak={buildStreak()}
        getCurrentlyPlaying={getCurrentlyPlaying}
        play={vi.fn().mockResolvedValue({ ok: true, status: 200 })}
        setRepeat={vi.fn().mockResolvedValue(undefined)}
        onCountUpdate={vi.fn()}
      />,
    );

    await flushAsyncWork();
    expect(getCurrentlyPlaying).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    await flushAsyncWork();
    expect(getCurrentlyPlaying).toHaveBeenCalledTimes(2);

    setVisibility("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(12000);
    });

    expect(getCurrentlyPlaying).toHaveBeenCalledTimes(2);

    setVisibility("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await flushAsyncWork();
    expect(getCurrentlyPlaying).toHaveBeenCalledTimes(3);
  });

  it("stays idle behind a fresh leader and takes over after the leader disappears", async () => {
    const getCurrentlyPlaying = vi
      .fn()
      .mockResolvedValue({ status: 401, playback: null });

    localStorage.setItem(
      "ironman:enforcement-leader",
      JSON.stringify({ tabId: "other-tab", ts: Date.now() }),
    );

    render(
      <EnforcementEngine
        streak={buildStreak()}
        getCurrentlyPlaying={getCurrentlyPlaying}
        play={vi.fn().mockResolvedValue({ ok: true, status: 200 })}
        setRepeat={vi.fn().mockResolvedValue(undefined)}
        onCountUpdate={vi.fn()}
      />,
    );

    await flushAsyncWork();
    expect(getCurrentlyPlaying).not.toHaveBeenCalled();

    localStorage.removeItem("ironman:enforcement-leader");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ironman:enforcement-leader" }),
      );
      vi.advanceTimersByTime(4000);
    });

    await flushAsyncWork();
    expect(getCurrentlyPlaying).toHaveBeenCalledTimes(1);
  });

  it("suppresses repeated wrong-song corrections during the grace window", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () =>
      new Response(JSON.stringify({ broken: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const play = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const setRepeat = vi.fn().mockResolvedValue(undefined);
    const getCurrentlyPlaying = vi
      .fn()
      .mockResolvedValue({ status: 401, playback: null });

    const { rerender } = render(
      <EnforcementEngine
        streak={buildStreak()}
        getCurrentlyPlaying={getCurrentlyPlaying}
        play={play}
        setRepeat={setRepeat}
        onCountUpdate={vi.fn()}
        sdkState={{
          paused: false,
          position: 0,
          duration: 123000,
          trackId: "wrong-track",
        }}
      />,
    );

    await flushAsyncWork();
    expect(play).toHaveBeenCalledTimes(1);
    expect(setRepeat).toHaveBeenCalledTimes(1);

    rerender(
      <EnforcementEngine
        streak={buildStreak()}
        getCurrentlyPlaying={getCurrentlyPlaying}
        play={play}
        setRepeat={setRepeat}
        onCountUpdate={vi.fn()}
        sdkState={{
          paused: false,
          position: 0,
          duration: 123000,
          trackId: "wrong-track",
        }}
      />,
    );

    await flushAsyncWork();
    expect(play).toHaveBeenCalledTimes(1);
    expect(setRepeat).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(3001);
    });

    rerender(
      <EnforcementEngine
        streak={buildStreak()}
        getCurrentlyPlaying={getCurrentlyPlaying}
        play={play}
        setRepeat={setRepeat}
        onCountUpdate={vi.fn()}
        sdkState={{
          paused: false,
          position: 0,
          duration: 123000,
          trackId: "wrong-track",
        }}
      />,
    );

    await flushAsyncWork();
    expect(play).toHaveBeenCalledTimes(2);
    expect(setRepeat).toHaveBeenCalledTimes(2);
  });
});
