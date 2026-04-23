export const PALETTE_SAMPLE_SIZE = 64;
export const PALETTE_STOP_COUNT = 5;

type RGB = [number, number, number];
type LCH = [number, number, number];
type HeroBin = {
  chromaTotal: number;
  lightnessTotal: number;
  score: number;
  hueX: number;
  hueY: number;
};

const PALETTE_BUCKET_COUNT = 8;
const PALETTE_QUANTIZATION_STEP = 4;
const PALETTE_LIGHTNESS_STOPS = [0.25, 0.375, 0.5, 0.625, 0.75] as const;
const PALETTE_HERO_HUE_STEP = 24;
const PALETTE_HERO_MIN_CHROMA = 0.05;
const PALETTE_MIDDLE_LIGHTNESS = 0.72;
const PALETTE_MIDDLE_CHROMA = 0.14;

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

function extractPaletteFromRgbPixels(pixels: RGB[]): string[] {
  if (pixels.length === 0) return [];

  const pixelColors = pixels.map(rgbToOklch);
  const candidates = medianCut(pixels, PALETTE_BUCKET_COUNT).map(rgbToOklch);
  if (candidates.length === 0) return [];

  const hero = pickHeroColor(pixelColors, candidates);
  candidates.sort((a, b) => a[0] - b[0]);

  const darkest = pickClosest(candidates, 0, hero);
  const lightest = pickClosest(candidates, 1, hero);
  const darkMid = pickClosest(candidates, 0.33, hero);
  const lightMid = pickClosest(candidates, 0.66, hero);
  const middle = withLightnessAndChroma(
    hero,
    PALETTE_MIDDLE_LIGHTNESS,
    hero[1] >= PALETTE_HERO_MIN_CHROMA ? PALETTE_MIDDLE_CHROMA : hero[1],
  );

  return [
    formatOklch(darkest, PALETTE_LIGHTNESS_STOPS[0]),
    formatOklch(darkMid, PALETTE_LIGHTNESS_STOPS[1]),
    formatOklch(middle, middle[0]),
    formatOklch(lightMid, PALETTE_LIGHTNESS_STOPS[3]),
    formatOklch(lightest, PALETTE_LIGHTNESS_STOPS[4]),
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

function pickHeroColor(pixels: LCH[], fallback: LCH[]): LCH {
  const binCount = Math.round(360 / PALETTE_HERO_HUE_STEP);
  const bins = new Map<number, HeroBin>();

  for (const [l, c, h] of pixels) {
    if (c < PALETTE_HERO_MIN_CHROMA) continue;

    const bin = Math.round(h / PALETTE_HERO_HUE_STEP) % binCount;
    const current = bins.get(bin) ?? {
      chromaTotal: 0,
      lightnessTotal: 0,
      score: 0,
      hueX: 0,
      hueY: 0,
    };
    const radians = (h * Math.PI) / 180;

    current.chromaTotal += c * c;
    current.lightnessTotal += l * c;
    current.score += c;
    current.hueX += Math.cos(radians) * c;
    current.hueY += Math.sin(radians) * c;

    bins.set(bin, current);
  }

  let best: HeroBin | null = null;

  for (const candidate of bins.values()) {
    if (!best || candidate.score > best.score) {
      best = candidate;
    }
  }

  if (!best) return pickMostChromatic(fallback);

  let hue = (Math.atan2(best.hueY, best.hueX) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return [best.lightnessTotal / best.score, best.chromaTotal / best.score, hue];
}

function pickMostChromatic(colors: LCH[]): LCH {
  let best = colors[0] ?? [0, 0, 0];

  for (let i = 1; i < colors.length; i++) {
    if (colors[i][1] > best[1]) best = colors[i];
  }

  return best;
}

function withLightnessAndChroma([, , h]: LCH, l: number, c: number): LCH {
  return [l, c, h];
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
