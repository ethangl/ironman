import { useEffect, useRef, useState } from "react";

import { spotifyArtistsClient } from "@/features/spotify/client";
import type { LastFmArtistMatch } from "@/types";

export function useLastFmArtist({
  artistName,
  musicBrainzId,
}: {
  artistName: string;
  musicBrainzId: string | null;
}) {
  const [data, setData] = useState<LastFmArtistMatch | null>(null);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;
    const normalizedArtistName = artistName.trim();

    if (!normalizedArtistName) {
      setData(null);
      return;
    }

    void spotifyArtistsClient
      .getLastFmArtist(normalizedArtistName, musicBrainzId)
      .then((nextData) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setData(nextData ?? null);
      })
      .catch(() => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setData(null);
      });
  }, [artistName, musicBrainzId]);

  return data;
}
