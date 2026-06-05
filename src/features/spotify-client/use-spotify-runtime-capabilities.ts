import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  clearCachedSpotifyAccessToken,
  getCachedSpotifyAccessToken,
} from "./spotify-access-token";
import {
  clearCachedSpotifyAccountLink,
  hasCachedSpotifyAccountLink,
} from "./spotify-account-link";
import {
  clearSpotifyAuthFailure,
  getSpotifyAuthFailed,
  subscribeSpotifyAuthFailure,
} from "./spotify-auth-status";

type SpotifyConnection = "unknown" | "connected" | "disconnected";

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

  // A spotify action that failed with SpotifyAuthRequired (dead token the
  // request loop couldn't refresh) flips this on — account linkage alone can't
  // see a server-side-revoked token. Cleared by a session change here and by a
  // successful spotify action in the convex client.
  const spotifyAuthFailed = useSyncExternalStore(
    subscribeSpotifyAuthFailure,
    getSpotifyAuthFailed,
    getSpotifyAuthFailed,
  );

  useEffect(() => {
    clearSpotifyAuthFailure();
  }, [sessionUserId]);

  const hasLinkedSpotifyAccount =
    !!sessionUserId && spotifyAccountLink === "linked" && !spotifyAuthFailed;

  const spotifyConnection: SpotifyConnection = !sessionUserId
    ? "disconnected"
    : spotifyAuthFailed
      ? "disconnected"
      : spotifyAccountLink === "unknown"
        ? "unknown"
        : spotifyAccountLink === "linked"
          ? "connected"
          : "disconnected";

  return {
    canControlPlayback: hasLinkedSpotifyAccount && !spotifyTokenUnavailable,
    getSpotifyAccessToken,
    spotifyConnection,
  };
}
