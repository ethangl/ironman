import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./spotify-convex-client", () => ({
  getAuthenticatedSpotifyConvexClient: vi.fn(),
}));

import { api } from "@api";
import { getAuthenticatedSpotifyConvexClient } from "./spotify-convex-client";
import { spotifyPlaybackClient } from "./spotify-playback-client";

describe("spotifyPlaybackClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests currently playing state from Convex", async () => {
    const action = vi.fn().mockResolvedValue({
      status: 204,
      playback: null,
    });

    vi.mocked(getAuthenticatedSpotifyConvexClient).mockResolvedValue({
      action,
    } as never);

    await expect(spotifyPlaybackClient.getCurrentlyPlaying()).resolves.toEqual({
      status: 204,
      playback: null,
    });

    expect(getAuthenticatedSpotifyConvexClient).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(
      api.spotify.playbackCurrentlyPlaying,
      {},
    );
  });

  it.each([
    {
      name: "play",
      call: () =>
        spotifyPlaybackClient.play(
          "spotify:track:track-1",
          "device-1",
          12_345,
        ),
      ref: api.spotify.playbackPlay,
      args: {
        uri: "spotify:track:track-1",
        deviceId: "device-1",
        offsetMs: 12_345,
      },
      result: { ok: true, status: 204 },
    },
    {
      name: "resume",
      call: () => spotifyPlaybackClient.resume(),
      ref: api.spotify.playbackResume,
      args: {},
      result: { ok: true, status: 204 },
    },
    {
      name: "pause",
      call: () => spotifyPlaybackClient.pause(),
      ref: api.spotify.playbackPause,
      args: {},
      result: { ok: true, status: 204 },
    },
    {
      name: "setRepeat",
      call: () => spotifyPlaybackClient.setRepeat("track", "device-1"),
      ref: api.spotify.playbackSetRepeat,
      args: { state: "track", deviceId: "device-1" },
      result: { ok: true, status: 204 },
    },
    {
      name: "setVolume",
      call: () => spotifyPlaybackClient.setVolume(65),
      ref: api.spotify.playbackSetVolume,
      args: { percent: 65 },
      result: { ok: true, status: 204 },
    },
  ])("forwards $name to Convex", async ({ call, ref, args, result }) => {
    const action = vi.fn().mockResolvedValue(result);

    vi.mocked(getAuthenticatedSpotifyConvexClient).mockResolvedValue({
      action,
    } as never);

    await expect(call()).resolves.toEqual(result);

    expect(getAuthenticatedSpotifyConvexClient).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith(ref, args);
  });
});
