import type { SongStats } from "@/lib/song-stats";

import { requestOptionalJson } from "@/data/http";

export function getSongStats(trackId: string) {
  return requestOptionalJson<SongStats>(
    `/api/songs/${trackId}`,
    undefined,
    { fallbackMessage: "Could not load song stats." },
  );
}
