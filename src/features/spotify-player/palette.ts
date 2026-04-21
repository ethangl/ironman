export const PALETTE_SAMPLE_SIZE = 64;

type RGB = [number, number, number];
type LCH = [number, number, number];

const PALETTE_BUCKET_COUNT = 8;
const PALETTE_QUANTIZATION_STEP = 4;

export function extractPaletteFromRawPixels(
  data: ArrayLike<number>,
  channels = 4,
): string[] {
  if (channels < 3) return [];

  const pixels: RGB[] = [];

  for (let i = 0; i + 2 < data.length; i += channels) {
    const alpha = channels > 3 ? Number(data[i + 3] ?? 255) : 255;
    if (alpha < 16) continue;

    pixels.push([
      quantizeChannel(Number(data[i] ?? 0)),
      quantizeChannel(Number(data[i + 1] ?? 0)),
      quantizeChannel(Number(data[i + 2] ?? 0)),
    ]);
  }

  return extractPaletteFromRgbPixels(pixels);
}

export function extractPaletteFromRgbPixels(pixels: RGB[]): string[] {
  if (pixels.length === 0) return [];

  const candidates = medianCut(pixels, PALETTE_BUCKET_COUNT).map(rgbToOklch);
  if (candidates.length === 0) return [];

  let heroIdx = 0;
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i][1] > candidates[heroIdx][1]) heroIdx = i;
  }

  const hero = candidates.splice(heroIdx, 1)[0] ?? candidates[0] ?? [0, 0, 0];
  candidates.sort((a, b) => a[0] - b[0]);

  const darkest = pickClosest(candidates, 0, hero);
  const lightest = pickClosest(candidates, 1, hero);
  const darkMid = pickClosest(candidates, 0.33, hero);
  const lightMid = pickClosest(candidates, 0.66, hero);

  return [
    formatOklch(darkest, 0.25),
    formatOklch(darkMid, 0.375),
    formatOklch(hero, 0.5),
    formatOklch(lightMid, 0.625),
    formatOklch(lightest, 0.75),
  ];
}

function quantizeChannel(value: number): number {
  return (
    Math.round(value / PALETTE_QUANTIZATION_STEP) * PALETTE_QUANTIZATION_STEP
  );
}

function pickClosest(arr: LCH[], target: number, fallback: LCH): LCH {
  if (arr.length === 0) return fallback;

  let best = 0;
  for (let i = 1; i < arr.length; i++) {
    if (Math.abs(arr[i][0] - target) < Math.abs(arr[best][0] - target)) {
      best = i;
    }
  }

  return arr.splice(best, 1)[0] ?? fallback;
}

function formatOklch([, c, h]: LCH, l: number) {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)})`;
}

function rgbToOklch([r, g, b]: RGB): LCH {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l1 = Math.cbrt(l_);
  const m1 = Math.cbrt(m_);
  const s1 = Math.cbrt(s_);

  const L = 0.2104542553 * l1 + 0.793617785 * m1 - 0.0040720468 * s1;
  const a = 1.9779984951 * l1 - 2.428592205 * m1 + 0.4505937099 * s1;
  const bLab = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.808675766 * s1;

  const C = Math.sqrt(a * a + bLab * bLab);
  let H = (Math.atan2(bLab, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return [L, C, H];
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function medianCut(pixels: RGB[], target: number): RGB[] {
  if (pixels.length === 0) return [];

  const buckets: RGB[][] = [pixels];

  while (buckets.length < target) {
    let bestIdx = 0;
    let bestRange = -1;
    let bestChannel = 0;

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 2) continue;

      for (let channel = 0; channel < 3; channel++) {
        const values = bucket.map((pixel) => pixel[channel]);
        const range = Math.max(...values) - Math.min(...values);
        if (range > bestRange) {
          bestRange = range;
          bestIdx = i;
          bestChannel = channel;
        }
      }
    }

    if (bestRange <= 0) break;

    const bucket = buckets[bestIdx];
    bucket.sort((a, b) => a[bestChannel] - b[bestChannel]);
    const mid = Math.floor(bucket.length / 2);

    buckets.splice(bestIdx, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  return buckets.map(averageRgb);
}

function averageRgb(pixels: RGB[]): RGB {
  if (pixels.length === 0) return [0, 0, 0];

  const sum = [0, 0, 0];
  for (const pixel of pixels) {
    sum[0] += pixel[0];
    sum[1] += pixel[1];
    sum[2] += pixel[2];
  }

  return [
    Math.round(sum[0] / pixels.length),
    Math.round(sum[1] / pixels.length),
    Math.round(sum[2] / pixels.length),
  ];
}
