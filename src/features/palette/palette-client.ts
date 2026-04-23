import { extractPaletteInBrowser } from "./browser-palette";

export interface PaletteClient {
  get: (url: string) => Promise<string[]>;
}

type PaletteLoader = (imageUrl: string) => Promise<string[]>;

export function createPaletteClient(
  loadPalette: PaletteLoader = extractPaletteInBrowser,
): PaletteClient {
  const requestsByUrl = new Map<string, Promise<string[]>>();

  return {
    get: (imageUrl) => {
      const cachedRequest = requestsByUrl.get(imageUrl);
      if (cachedRequest) return cachedRequest;

      const request = loadAndLogPalette(imageUrl, loadPalette).catch((error) => {
        requestsByUrl.delete(imageUrl);
        throw error;
      });
      requestsByUrl.set(imageUrl, request);

      return request;
    },
  };
}

export const paletteClient = createPaletteClient();

async function loadAndLogPalette(
  imageUrl: string,
  loadPalette: PaletteLoader,
): Promise<string[]> {
  try {
    const colors = await loadPalette(imageUrl);
    logPaletteResult("client", imageUrl);
    return colors;
  } catch (error) {
    logPaletteResult(
      "failed",
      imageUrl,
      error instanceof Error ? error.message : "palette extraction failed",
    );
    throw error;
  }
}

function logPaletteResult(
  result: "client" | "failed",
  imageUrl: string,
  reason?: string,
) {
  if (!import.meta.env.DEV) return;

  if (reason) {
    console.info("[palette]", result, reason, imageUrl);
    return;
  }

  console.info("[palette]", result, imageUrl);
}
