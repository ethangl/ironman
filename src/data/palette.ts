import { requestJson } from "@/data/http";

export function getPalette(url: string) {
  return requestJson<string[]>(
    `/api/palette?url=${encodeURIComponent(url)}`,
    undefined,
    "Could not extract palette.",
  );
}
