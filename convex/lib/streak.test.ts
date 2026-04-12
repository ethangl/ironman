import { describe, expect, it } from "vitest";

import { detectCompletion, isNearTrackEnd } from "./streak";

describe("streak completion helpers", () => {
  it("arms only when progress is near the end of the track", () => {
    expect(isNearTrackEnd(86_000, 100_000)).toBe(true);
    expect(isNearTrackEnd(84_000, 100_000)).toBe(false);
  });

  it("counts a completion only when playback wraps from the end window", () => {
    expect(detectCompletion(true, 8_000, 100_000, true)).toBe(true);
    expect(detectCompletion(false, 8_000, 100_000, true)).toBe(false);
    expect(detectCompletion(true, 8_000, 100_000, false)).toBe(false);
  });
});
