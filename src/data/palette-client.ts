import { ConvexHttpClient } from "convex/browser";

import { api } from "@api";
import { extractPaletteInBrowser } from "@/lib/browser-palette";
import { getConvexUrl } from "@/lib/convex-env";

export interface PaletteClient {
  get: (url: string) => Promise<string[]>;
}

let cachedPaletteClient: PaletteClient | null = null;
let cachedPaletteUrl: string | null = null;
const paletteRequestsByUrl = new Map<string, Promise<string[]>>();

export function createConvexPaletteClient(convexUrl: string): PaletteClient {
  const convex = new ConvexHttpClient(convexUrl);
  const serverPaletteClient: PaletteClient = {
    get: (imageUrl) => convex.action(api.palette.extract, { imageUrl }),
  };

  return {
    get: (imageUrl) => {
      const cachedRequest = paletteRequestsByUrl.get(imageUrl);
      if (cachedRequest) return cachedRequest;

      const request = getPaletteClientFirst(serverPaletteClient, imageUrl);
      paletteRequestsByUrl.set(imageUrl, request);

      request.catch(() => {
        paletteRequestsByUrl.delete(imageUrl);
      });

      return request;
    },
  };
}

function getDefaultConvexPaletteClient() {
  const convexUrl = getConvexUrl("Convex palette access");

  if (!cachedPaletteClient || cachedPaletteUrl !== convexUrl) {
    cachedPaletteClient = createConvexPaletteClient(convexUrl);
    cachedPaletteUrl = convexUrl;
  }

  return cachedPaletteClient;
}

export const convexPaletteClient: PaletteClient = {
  get: (url) => getDefaultConvexPaletteClient().get(url),
};

async function getPaletteClientFirst(
  serverPaletteClient: PaletteClient,
  imageUrl: string,
): Promise<string[]> {
  try {
    const colors = await extractPaletteInBrowser(imageUrl);
    if (colors.length > 0) {
      logPalettePath("client", imageUrl);
      return colors;
    }

    logPalettePath("fallback", imageUrl, "client returned no colors");
  } catch (error) {
    // Fall back to the server when the browser cannot read image pixels
    // because of CORS, decode failures, or unsupported DOM APIs.
    logPalettePath(
      "fallback",
      imageUrl,
      error instanceof Error ? error.message : "browser extraction failed",
    );
  }

  return serverPaletteClient.get(imageUrl);
}

function logPalettePath(
  path: "client" | "fallback",
  imageUrl: string,
  reason?: string,
) {
  if (!import.meta.env.DEV) return;

  if (reason) {
    console.info("[palette]", path, reason, imageUrl);
    return;
  }

  console.info("[palette]", path, imageUrl);
}
