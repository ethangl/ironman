import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEnsureTrackAudioFeatures } from "./use-ensure-track-audio-features";

const mockEnsureTrackAudioFeatures = vi.fn();

vi.mock("./reccobeats-client", () => ({
  convexReccobeatsClient: {
    ensureTrackAudioFeatures: (...args: unknown[]) =>
      mockEnsureTrackAudioFeatures(...args),
  },
}));

describe("useEnsureTrackAudioFeatures", () => {
  beforeEach(() => {
    mockEnsureTrackAudioFeatures.mockReset();
  });

  it("ensures features for the active track id", async () => {
    mockEnsureTrackAudioFeatures.mockResolvedValue(undefined);

    renderHook(() => useEnsureTrackAudioFeatures("track-1"));

    await waitFor(() => {
      expect(mockEnsureTrackAudioFeatures).toHaveBeenCalledWith(["track-1"]);
    });
  });

  it("does nothing when there is no active track id", () => {
    renderHook(() => useEnsureTrackAudioFeatures(null));

    expect(mockEnsureTrackAudioFeatures).not.toHaveBeenCalled();
  });
});
