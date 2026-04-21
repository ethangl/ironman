import {
  extractPaletteFromRawPixels,
  PALETTE_SAMPLE_SIZE,
} from "@shared/palette";

export async function extractPaletteInBrowser(
  imageUrl: string,
): Promise<string[]> {
  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof Image === "undefined"
  ) {
    throw new Error("Browser palette extraction is unavailable.");
  }

  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = PALETTE_SAMPLE_SIZE;
  canvas.height = PALETTE_SAMPLE_SIZE;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Unable to create a 2D canvas context.");

  context.drawImage(image, 0, 0, PALETTE_SAMPLE_SIZE, PALETTE_SAMPLE_SIZE);

  const imageData = context.getImageData(
    0,
    0,
    PALETTE_SAMPLE_SIZE,
    PALETTE_SAMPLE_SIZE,
  );

  return extractPaletteFromRawPixels(imageData.data, 4);
}

function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => {
      cleanup();
      resolve(image);
    };
    image.onerror = () => {
      cleanup();
      reject(
        new Error(`Unable to load image for palette extraction: ${imageUrl}`),
      );
    };

    image.src = imageUrl;

    function cleanup() {
      image.onload = null;
      image.onerror = null;
    }
  });
}
