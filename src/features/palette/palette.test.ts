import { describe, expect, it } from "vitest";

import {
  extractPaletteFromRawPixels,
  PALETTE_MIDDLE_CHROMA,
  PALETTE_MIDDLE_LIGHTNESS,
  PALETTE_STOP_COUNT,
} from "./palette";

function parseOklch(value: string | undefined) {
  const match = value?.match(/^oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)$/);
  if (!match) {
    throw new Error(`Not an oklch() string: ${value}`);
  }
  return {
    lightness: Number(match[1]),
    chroma: Number(match[2]),
    hue: Number(match[3]),
  };
}

const expectedLightness = PALETTE_MIDDLE_LIGHTNESS * 100;

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

  it("desaturates the middle stop for monochrome art", () => {
    const pixels = new Uint8ClampedArray(
      Array.from({ length: 16 }, () => [84, 84, 84, 255]).flat(),
    );

    const palette = extractPaletteFromRawPixels(pixels, 4);
    const middle = parseOklch(palette[2]);

    expect(palette).toHaveLength(PALETTE_STOP_COUNT);
    // Monochrome art has no hero chroma, so the middle stop stays desaturated...
    expect(middle.chroma).toBeCloseTo(0, 3);
    // ...while still sitting at the configured middle lightness.
    expect(middle.lightness).toBeCloseTo(expectedLightness, 1);
  });

  it("normalizes the middle stop to the configured lightness and chroma", () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255,
      255, 32, 32, 255,
      224, 16, 48, 255,
      192, 24, 24, 255,
    ]);

    const palette = extractPaletteFromRawPixels(pixels, 4);
    const middle = parseOklch(palette[2]);

    expect(middle.lightness).toBeCloseTo(expectedLightness, 1);
    expect(middle.chroma).toBeCloseTo(PALETTE_MIDDLE_CHROMA, 4);
  });

  it("keeps a small saturated accent as the middle hue", () => {
    const neutralPixels = Array.from({ length: 32 }, () => [32, 32, 32, 255]);
    const accentPixels = Array.from({ length: 4 }, () => [255, 0, 0, 255]);
    const pixels = new Uint8ClampedArray(
      [...neutralPixels, ...accentPixels].flat(),
    );

    const palette = extractPaletteFromRawPixels(pixels, 4);
    const middle = parseOklch(palette[2]);

    // The hue comes from the red accent; the lightness/chroma stay configured.
    expect(middle.lightness).toBeCloseTo(expectedLightness, 1);
    expect(middle.chroma).toBeCloseTo(PALETTE_MIDDLE_CHROMA, 4);
    expect(middle.hue).toBeGreaterThanOrEqual(0);
    expect(middle.hue).toBeLessThan(40);
  });
});
