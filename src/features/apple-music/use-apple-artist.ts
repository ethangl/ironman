import { api } from "@api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";

export interface AppleArtistTrack {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumImage: string | null;
  durationMs: number;
  isrc: string | null;
}

export interface AppleArtistDetail {
  artist: { id: string; name: string; image: string | null };
  topSongs: readonly AppleArtistTrack[];
}

export type AppleArtistState =
  | { status: "loading" }
  | { status: "ready"; detail: AppleArtistDetail }
  | { status: "not_found" }
  | { status: "error" };

/**
 * Loads an Apple catalog artist + their top songs (dev-token only, no
 * connection required). One-shot fetch per `artistId`.
 */
export function useAppleArtist(artistId: string): AppleArtistState {
  const fetchArtist = useAction(api.playback.artist);
  const [state, setState] = useState<AppleArtistState>({ status: "loading" });

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
