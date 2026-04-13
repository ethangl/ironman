import { useCallback, useEffect, useState } from "react";

import { convexAuthClient as authClient } from "@/lib/convex-auth-client";

type SpotifyConnection = "unknown" | "connected" | "disconnected";

export function useSpotifyConnection(sessionUserId: string | null) {
  const [lastSpotifyReadyUserId, setLastSpotifyReadyUserId] = useState<
    string | null
  >(null);
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection>(
    () => (sessionUserId ? "unknown" : "disconnected"),
  );

  const getSpotifyAccessToken = useCallback(async () => {
    const response = await authClient.getAccessToken({ providerId: "spotify" });
    const token = response.data?.accessToken ?? null;
    setSpotifyConnection(token ? "connected" : "disconnected");
    return token;
  }, []);

  useEffect(() => {
    if (!sessionUserId) {
      setSpotifyConnection("disconnected");
      return;
    }

    setSpotifyConnection((current) =>
      current === "connected" ? current : "unknown",
    );

    let cancelled = false;

    void authClient
      .getAccessToken({ providerId: "spotify" })
      .then((response) => {
        if (cancelled) return;
        setSpotifyConnection(
          response.data?.accessToken ? "connected" : "disconnected",
        );
      })
      .catch(() => {
        if (cancelled) return;
        setSpotifyConnection("disconnected");
      });

    return () => {
      cancelled = true;
    };
  }, [sessionUserId]);

  useEffect(() => {
    if (!sessionUserId) {
      setLastSpotifyReadyUserId(null);
      return;
    }

    if (spotifyConnection === "connected") {
      setLastSpotifyReadyUserId(sessionUserId);
    }
  }, [sessionUserId, spotifyConnection]);

  return {
    canUsePersonalSpotify:
      !!sessionUserId &&
      (spotifyConnection === "connected" ||
        lastSpotifyReadyUserId === sessionUserId),
    getSpotifyAccessToken,
    spotifyConnection,
  };
}
