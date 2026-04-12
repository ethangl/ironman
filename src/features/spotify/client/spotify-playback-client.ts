import type { PlayResult, SpotifyPlayback } from "@/types/spotify-playback";
import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";

interface SpotifyPlaybackClient {
  getCurrentlyPlaying: () => Promise<{
    status: number;
    playback: SpotifyPlayback | null;
  }>;
  play: (uri: string, deviceId?: string) => Promise<PlayResult>;
  resume: () => Promise<PlayResult>;
  pause: () => Promise<PlayResult>;
  setRepeat: (
    state: "track" | "context" | "off",
    deviceId?: string,
  ) => Promise<PlayResult>;
  setVolume: (percent: number) => Promise<PlayResult>;
}

export const spotifyPlaybackClient: SpotifyPlaybackClient = {
  async getCurrentlyPlaying() {
    const client = await getAuthenticatedSpotifyConvexClient();
    return client.action(api.spotify.playbackCurrentlyPlaying, {});
  },
  async play(uri, deviceId) {
    const client = await getAuthenticatedSpotifyConvexClient();
    return client.action(api.spotify.playbackPlay, {
      uri,
      deviceId: deviceId ?? undefined,
    });
  },
  async resume() {
    const client = await getAuthenticatedSpotifyConvexClient();
    return client.action(api.spotify.playbackResume, {});
  },
  async pause() {
    const client = await getAuthenticatedSpotifyConvexClient();
    return client.action(api.spotify.playbackPause, {});
  },
  async setRepeat(state, deviceId) {
    const client = await getAuthenticatedSpotifyConvexClient();
    return client.action(api.spotify.playbackSetRepeat, {
      state,
      deviceId: deviceId ?? undefined,
    });
  },
  async setVolume(percent) {
    const client = await getAuthenticatedSpotifyConvexClient();
    return client.action(api.spotify.playbackSetVolume, {
      percent,
    });
  },
};
