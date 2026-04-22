import { useCallback } from "react";

import { useStableAction } from "@/hooks/use-stable-action";
import { getMusicBrainzArtist } from "./musicbrainz-client";
import type { MusicBrainzArtistMatch } from "./types";

export function useMusicBrainzArtist(artistId: string) {
  const { data } = useStableAction<MusicBrainzArtistMatch>({
    enabled: artistId !== "",
    load: useCallback(async () => {
      return await getMusicBrainzArtist(artistId);
    }, [artistId]),
  });

  return data;
}
