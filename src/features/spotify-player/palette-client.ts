import { extractPaletteInBrowser } from "./browser-palette";

export interface PaletteClient {
  get: (url: string) => Promise<string[]>;
}

const paletteRequestsByUrl = new Map<string, Promise<string[]>>();

export function createPaletteClient(): PaletteClient {
  return {
    get: (imageUrl) => {
      const cachedRequest = paletteRequestsByUrl.get(imageUrl);
      if (cachedRequest) return cachedRequest;

      const request = getClientPalette(imageUrl);
      paletteRequestsByUrl.set(imageUrl, request);

      request.catch(() => {
        paletteRequestsByUrl.delete(imageUrl);
      });

      return request;
    },
  };
}

export const paletteClient = createPaletteClient();

async function getClientPalette(imageUrl: string): Promise<string[]> {
  try {
    const colors = await extractPaletteInBrowser(imageUrl);
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
