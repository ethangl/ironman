import { api } from "@api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";

import type { CatalogSong } from "./track";

export type ArtistTrack = CatalogSong;

/** An album or single in an artist's discography (the releases sections). */
export interface Release {
  id: string;
  name: string;
  image: string | null;
  releaseDate: string | null;
  trackCount: number;
}

export interface ArtistDetail {
  artist: { id: string; name: string; image: string | null };
  topSongs: readonly ArtistTrack[];
  albums: readonly Release[];
  singles: readonly Release[];
}

export type ArtistState =
  | { status: "loading" }
  | { status: "ready"; detail: ArtistDetail }
  | { status: "not_found" }
  | { status: "error" };

/**
 * Loads an Apple catalog artist + their top songs (dev-token only, no
 * connection required). One-shot fetch per `artistId`.
 */
export function useArtist(artistId: string): ArtistState {
  const fetchArtist = useAction(api.playback.artist);
  const [state, setState] = useState<ArtistState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    void fetchArtist({ artistId })
      .then((detail) => {
        if (cancelled) return;
        setState(
          detail ? { status: "ready", detail } : { status: "not_found" },
        );
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [artistId, fetchArtist]);

  return state;
}
