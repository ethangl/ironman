import { api } from "@api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";

import type { CatalogSong } from "./track";

export interface AlbumDetail {
  album: {
    id: string;
    name: string;
    artistName: string;
    artistId: string | null;
    image: string | null;
  };
  tracks: readonly CatalogSong[];
}

export type AlbumState =
  | { status: "loading" }
  | { status: "ready"; detail: AlbumDetail }
  | { status: "not_found" }
  | { status: "error" };

/**
 * Loads an Apple catalog album + its tracks (dev-token only, no connection
 * required). One-shot fetch per `albumId`. Mirrors {@link useArtist}.
 */
export function useAlbum(albumId: string): AlbumState {
  const fetchAlbum = useAction(api.playback.album);
  const [state, setState] = useState<AlbumState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    void fetchAlbum({ albumId })
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
  }, [albumId, fetchAlbum]);

  return state;
}
