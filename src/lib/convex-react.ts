import { ConvexReactClient } from "convex/react";

let cachedClient: ConvexReactClient | null = null;
let cachedUrl: string | null = null;

export function getConvexReactClient(url: string) {
  if (!cachedClient || cachedUrl !== url) {
    cachedClient = new ConvexReactClient(url);
    cachedUrl = url;
  }

  return cachedClient;
}
