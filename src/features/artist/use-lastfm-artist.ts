import { useCallback } from "react";

import { useStableAction } from "@/hooks/use-stable-action";
import { getLastFmArtist } from "./lastfm-client";
import type { LastFmArtistMatch } from "./types";

export function useLastFmArtist({
  artistName,
  musicBrainzId,
}: {
  artistName: string;
  musicBrainzId: string | null;
}) {
  const normalizedArtistName = artistName.trim();

  const { data } = useStableAction<LastFmArtistMatch>({
    enabled: normalizedArtistName !== "",
    load: useCallback(async () => {
      return await getLastFmArtist(normalizedArtistName, musicBrainzId);
    }, [musicBrainzId, normalizedArtistName]),
  });

  return data;
}
