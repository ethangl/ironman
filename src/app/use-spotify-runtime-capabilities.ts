import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearCachedSpotifyAccessToken,
  getCachedSpotifyAccessToken,
} from "@/app/lib/spotify-access-token";
import {
  clearCachedSpotifyAccountLink,
  hasCachedSpotifyAccountLink,
} from "@/app/lib/spotify-account-link";
import type { SpotifyConnection } from "./app-runtime-types";

type SpotifyAccountLinkState = "unknown" | "linked" | "unlinked";

function useSpotifyAccountLinkState(sessionUserId: string | null) {
  const previousSessionUserIdRef = useRef<string | null>(null);
  const [spotifyAccountLink, setSpotifyAccountLink] =
    useState<SpotifyAccountLinkState>(() =>
      sessionUserId ? "unknown" : "unlinked",
    );

  useEffect(() => {
    const previousSessionUserId = previousSessionUserIdRef.current;
    if (previousSessionUserId && previousSessionUserId !== sessionUserId) {
      clearCachedSpotifyAccountLink(previousSessionUserId);
    }
    previousSessionUserIdRef.current = sessionUserId;

    if (!sessionUserId) {
      setSpotifyAccountLink("unlinked");
      return;
    }

    setSpotifyAccountLink((current) =>
      current === "linked" ? current : "unknown",
    );

    let cancelled = false;

    void hasCachedSpotifyAccountLink(sessionUserId)
      .then((linked) => {
        if (cancelled) return;
        setSpotifyAccountLink(linked ? "linked" : "unlinked");
      })
      .catch(() => {
        if (cancelled) return;
        setSpotifyAccountLink("unlinked");
      });

    return () => {
      cancelled = true;
    };
  }, [sessionUserId]);

  return spotifyAccountLink;
}

function useSpotifyPlaybackAccess(sessionUserId: string | null) {
  const previousSessionUserIdRef = useRef<string | null>(null);
  const [spotifyTokenUnavailable, setSpotifyTokenUnavailable] = useState(false);

  useEffect(() => {
    const previousSessionUserId = previousSessionUserIdRef.current;
    if (previousSessionUserId && previousSessionUserId !== sessionUserId) {
      clearCachedSpotifyAccessToken(previousSessionUserId);
    }
    previousSessionUserIdRef.current = sessionUserId;

    setSpotifyTokenUnavailable(false);
  }, [sessionUserId]);

  const getSpotifyAccessToken = useCallback(async () => {
    if (!sessionUserId) {
      setSpotifyTokenUnavailable(false);
      return null;
    }

    const token = await getCachedSpotifyAccessToken(sessionUserId);
    setSpotifyTokenUnavailable(!token);
    return token;
  }, [sessionUserId]);

  return {
    getSpotifyAccessToken,
    spotifyTokenUnavailable,
  };
}

export function useSpotifyRuntimeCapabilities(sessionUserId: string | null) {
  const spotifyAccountLink = useSpotifyAccountLinkState(sessionUserId);
  const { getSpotifyAccessToken, spotifyTokenUnavailable } =
    useSpotifyPlaybackAccess(sessionUserId);

  const hasLinkedSpotifyAccount =
    !!sessionUserId && spotifyAccountLink === "linked";
  const canUsePersonalSpotify =
    hasLinkedSpotifyAccount && !spotifyTokenUnavailable;

  const spotifyConnection: SpotifyConnection = !sessionUserId
    ? "disconnected"
    : spotifyAccountLink === "unknown"
      ? "unknown"
      : spotifyAccountLink === "unlinked" || spotifyTokenUnavailable
        ? "disconnected"
        : "connected";

  return {
    canBrowsePersonalSpotify: canUsePersonalSpotify,
    canControlPlayback: canUsePersonalSpotify,
    getSpotifyAccessToken,
    spotifyConnection,
  };
}
