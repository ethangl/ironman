"use node";

import sharp from "sharp";
import {
  extractPaletteFromRawPixels,
  PALETTE_SAMPLE_SIZE,
} from "../../shared/palette";

export async function extractPalette(imageUrl: string): Promise<string[]> {
  const res = await fetch(imageUrl, { cache: "no-store" });
  if (!res.ok) return [];

  const buffer = Buffer.from(await res.arrayBuffer());

  const { data, info } = await sharp(buffer)
    .resize(PALETTE_SAMPLE_SIZE, PALETTE_SAMPLE_SIZE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return extractPaletteFromRawPixels(data, info.channels);
}
