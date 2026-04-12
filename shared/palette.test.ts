import { describe, expect, it } from "vitest";

import { extractPaletteFromRawPixels } from "./palette";

describe("extractPaletteFromRawPixels", () => {
  it("builds five oklch stops from rgba pixels", () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      255, 255, 0, 255,
    ]);

    const palette = extractPaletteFromRawPixels(pixels, 4);

    expect(palette).toHaveLength(5);
    palette.forEach((color) => {
      expect(color).toMatch(/^oklch\(/);
    });
  });

  it("still returns five stops for monochrome art", () => {
    const pixels = new Uint8ClampedArray(
      Array.from({ length: 16 }, () => [42, 84, 126, 255]).flat(),
    );

    expect(extractPaletteFromRawPixels(pixels, 4)).toHaveLength(5);
  });
});
