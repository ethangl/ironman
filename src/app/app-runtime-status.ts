import type {
  SessionData,
  SpotifyConnection,
  SpotifyStatus,
} from "./app-runtime-types";

export function getSpotifyStatus({
  isPending,
  session,
  spotifyConnection,
}: {
  isPending: boolean;
  session: SessionData;
  spotifyConnection: SpotifyConnection;
}): SpotifyStatus {
  if (isPending) {
    return {
      code: "checking",
      title: "Checking your Spotify session",
      description:
        "We’re figuring out whether your Spotify account is ready before we load your personal listening data.",
      actionLabel: null,
    };
  }

  if (!session) {
    return {
      code: "signed_out",
      title: "Sign in with Spotify to unlock your listening view",
      description:
        "Connect Spotify to see your recent tracks, playlists, favorite artists, and playback controls.",
      actionLabel: "Sign in with Spotify",
    };
  }

  if (spotifyConnection === "unknown") {
    return {
      code: "checking",
      title: "Checking your Spotify connection",
      description:
        "Your app session is active. We’re confirming Spotify access before we turn on personal activity and playback controls.",
      actionLabel: null,
    };
  }

  if (spotifyConnection === "connected") {
    return {
      code: "connected",
      title: "Spotify connected",
      description: "Your Spotify account is connected and ready.",
      actionLabel: null,
    };
  }

  return {
    code: "reconnect_required",
    title: "Reconnect Spotify to restore personal features",
    description:
      "Your app session is still active, but Spotify access is unavailable right now. Reconnecting should bring back recent plays, playlists, and playback controls.",
    actionLabel: "Reconnect Spotify",
  };
}
