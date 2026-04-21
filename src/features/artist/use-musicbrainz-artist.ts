import { useEffect, useRef, useState } from "react";

import type { MusicBrainzArtistMatch } from "./types";
import { getMusicBrainzArtist } from "./musicbrainz-client";

export function useMusicBrainzArtist(artistId: string) {
  const [data, setData] = useState<MusicBrainzArtistMatch | null>(null);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;

    if (!artistId) {
      setData(null);
      return;
    }

    void getMusicBrainzArtist(artistId)
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
  }, [artistId]);

  return data;
}
