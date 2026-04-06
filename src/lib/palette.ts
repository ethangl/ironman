import sharp from "sharp";

type RGB = [number, number, number];
type LCH = [number, number, number];

/**
 * Extract 5 palette colors from an image URL using median-cut quantization.
 *
 *   palette-0 — darkest  (L pinned to 15%)
 *   palette-1 — dark-mid (L pinned to 32.5%)
 *   palette-2 — accent   (highest chroma, L pinned to 50%)
 *   palette-3 — light-mid(L pinned to 67.5%)
 *   palette-4 — lightest  (L pinned to 85%)
 */
export async function extractPalette(imageUrl: string): Promise<string[]> {
  const res = await fetch(imageUrl, { cache: "no-store" });
  if (!res.ok) return [];

  const buffer = Buffer.from(await res.arrayBuffer());

  const { data, info } = await sharp(buffer)
    .resize(64, 64, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Quantize channels to steps of 4 to absorb JPEG artifacts
  const pixels: RGB[] = [];
  const step = 4;
  for (let i = 0; i < data.length; i += info.channels) {
    pixels.push([
      Math.round(data[i] / step) * step,
      Math.round(data[i + 1] / step) * step,
      Math.round(data[i + 2] / step) * step,
    ]);
  }

  // More buckets than we need for better candidate selection
  const candidates = medianCut(pixels, 8).map(rgbToOklch);

  // Find the most chromatic color for the center slot
  let heroIdx = 0;
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i][1] > candidates[heroIdx][1]) heroIdx = i;
  }
  const hero = candidates.splice(heroIdx, 1)[0];

  // Sort the rest by lightness
  candidates.sort((a, b) => a[0] - b[0]);

  // Pick 4 from the remaining: darkest, dark-ish, light-ish, lightest
  const pick = (arr: LCH[], target: number): LCH => {
    let best = 0;
    for (let i = 1; i < arr.length; i++) {
      if (Math.abs(arr[i][0] - target) < Math.abs(arr[best][0] - target))
        best = i;
    }
    return arr.splice(best, 1)[0];
  };

  const darkest = pick(candidates, 0);
  const lightest = pick(candidates, 1);
  const darkMid = pick(candidates, 0.33);
  const lightMid = pick(candidates, 0.66);

  // Pin lightness values for contrast guarantees
  const fmt = ([, c, h]: LCH, l: number) =>
    `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)})`;

  return [
    fmt(darkest, 0.25),
    fmt(darkMid, 0.375),
    fmt(hero, 0.5),
    fmt(lightMid, 0.625),
    fmt(lightest, 0.75),
  ];
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

      for (let ch = 0; ch < 3; ch++) {
        const values = bucket.map((p) => p[ch]);
        const range = Math.max(...values) - Math.min(...values);
        if (range > bestRange) {
          bestRange = range;
          bestIdx = i;
          bestChannel = ch;
        }
      }
    }

    if (bestRange <= 0) break;

    const bucket = buckets[bestIdx];
    bucket.sort((a, b) => a[bestChannel] - b[bestChannel]);
    const mid = Math.floor(bucket.length / 2);

    buckets.splice(bestIdx, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  return buckets.map(average);
}

function average(pixels: RGB[]): RGB {
  if (pixels.length === 0) return [0, 0, 0];
  const sum = [0, 0, 0];
  for (const p of pixels) {
    sum[0] += p[0];
    sum[1] += p[1];
    sum[2] += p[2];
  }
  return [
    Math.round(sum[0] / pixels.length),
    Math.round(sum[1] / pixels.length),
    Math.round(sum[2] / pixels.length),
  ];
}
