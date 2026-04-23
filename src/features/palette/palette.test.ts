import { describe, expect, it } from "vitest";

import { extractPaletteFromRawPixels, PALETTE_STOP_COUNT } from "./palette";

describe("extractPaletteFromRawPixels", () => {
  it("builds five oklch stops from rgba pixels", () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      255, 255, 0, 255,
    ]);

    const palette = extractPaletteFromRawPixels(pixels, 4);

    expect(palette).toHaveLength(PALETTE_STOP_COUNT);
    palette.forEach((color) => {
      expect(color).toMatch(/^oklch\(/);
    });
  });

  it("still returns five stops for monochrome art", () => {
    const pixels = new Uint8ClampedArray(
      Array.from({ length: 16 }, () => [84, 84, 84, 255]).flat(),
    );

    const palette = extractPaletteFromRawPixels(pixels, 4);

    expect(palette).toHaveLength(PALETTE_STOP_COUNT);
    expect(palette[2]).toMatch(/^oklch\(70\.4% 0\.0000 /);
  });

  it("uses Tailwind red-400 lightness and chroma for the middle stop", () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255,
      255, 32, 32, 255,
      224, 16, 48, 255,
      192, 24, 24, 255,
    ]);

    const palette = extractPaletteFromRawPixels(pixels, 4);

    expect(palette[2]).toMatch(/^oklch\(70\.4% 0\.1910 /);
  });

  it("keeps a small saturated accent as the middle hue", () => {
    const neutralPixels = Array.from({ length: 32 }, () => [32, 32, 32, 255]);
    const accentPixels = Array.from({ length: 4 }, () => [255, 0, 0, 255]);
    const pixels = new Uint8ClampedArray(
      [...neutralPixels, ...accentPixels].flat(),
    );

    const palette = extractPaletteFromRawPixels(pixels, 4);
    const hue = Number.parseFloat(
      palette[2]?.match(/^oklch\(70\.4% 0\.1910 ([\d.]+)\)$/)?.[1] ?? "NaN",
    );

    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(40);
  });
});
