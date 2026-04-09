import { ConvexHttpClient } from "convex/browser";

let cachedClient: ConvexHttpClient | null = null;
let cachedUrl: string | null = null;

export function getServerConvexUrl() {
  const url = process.env.CONVEX_URL;
  if (!url) {
    throw new Error("Missing CONVEX_URL for server-side Convex access.");
  }

  return url;
}

export function getServerConvexClient() {
  const url = getServerConvexUrl();

  if (!cachedClient || cachedUrl !== url) {
    cachedClient = new ConvexHttpClient(url);
    cachedUrl = url;
  }

  return cachedClient;
}
