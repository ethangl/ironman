import { useCallback, type MutableRefObject } from "react";

import { spotifyPlaybackClient } from "@/features/spotify/client";
import type { PlayResult, SpotifyPlayback } from "@/types/spotify-playback";

import type { SpotifyPlayer } from "./spotify-sdk-types";

function logSpotifyControlWrite(details: {
  action: "play" | "resume" | "pause" | "repeat" | "volume";
  source: "sdk" | "api";
  status: number;
  durationMs: number;
  endpoint?: string;
  extra?: Record<string, string | number | boolean | null | undefined>;
}) {
  if (process.env.NODE_ENV === "test") return;

  const parts = [
    `[spotify-control] ${details.action}`,
    `source=${details.source}`,
    `status=${details.status}`,
    `duration=${details.durationMs}ms`,
  ];

  if (details.endpoint) {
    parts.push(`endpoint=${details.endpoint}`);
  }

  if (details.extra) {
    for (const [key, value] of Object.entries(details.extra)) {
      if (value === undefined || value === null) continue;
      parts.push(`${key}=${value}`);
    }
  }

  console.info(parts.join(" "));
}

export function useSpotifyControls({
  isSdkActive,
  playerRef,
}: {
  isSdkActive: () => boolean;
  playerRef: MutableRefObject<SpotifyPlayer | null>;
}) {
  const play = useCallback(
    async (
      uri: string,
      deviceId?: string,
      offsetMs?: number,
    ): Promise<PlayResult> => {
      const startedAt = Date.now();
      const res = await spotifyPlaybackClient.play(uri, deviceId, offsetMs);
      logSpotifyControlWrite({
        action: "play",
        source: "api",
        status: res.status,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/play",
        extra: { device_id: deviceId ?? null, position_ms: offsetMs ?? null, uri },
      });
      return res;
    },
    [],
  );

  const resume = useCallback(async (): Promise<PlayResult> => {
    const startedAt = Date.now();
    if (isSdkActive()) {
      await playerRef.current!.togglePlay();
      logSpotifyControlWrite({
        action: "resume",
        source: "sdk",
        status: 200,
        durationMs: Date.now() - startedAt,
      });
      return { ok: true, status: 200 };
    }

    const res = await spotifyPlaybackClient.resume();
    logSpotifyControlWrite({
      action: "resume",
      source: "api",
      status: res.status,
      durationMs: Date.now() - startedAt,
      endpoint: "/me/player/play",
    });
    return res;
  }, [isSdkActive, playerRef]);

  const pause = useCallback(async (): Promise<PlayResult> => {
    const startedAt = Date.now();
    if (isSdkActive()) {
      await playerRef.current!.pause();
      logSpotifyControlWrite({
        action: "pause",
        source: "sdk",
        status: 200,
        durationMs: Date.now() - startedAt,
      });
      return { ok: true, status: 200 };
    }

    const res = await spotifyPlaybackClient.pause();
    logSpotifyControlWrite({
      action: "pause",
      source: "api",
      status: res.status,
      durationMs: Date.now() - startedAt,
      endpoint: "/me/player/pause",
    });
    return res;
  }, [isSdkActive, playerRef]);

  const setVolume = useCallback(
    async (percent: number) => {
      const startedAt = Date.now();
      if (isSdkActive()) {
        await playerRef.current!.setVolume(percent / 100);
        logSpotifyControlWrite({
          action: "volume",
          source: "sdk",
          status: 200,
          durationMs: Date.now() - startedAt,
          extra: { percent },
        });
        return;
      }

      const res = await spotifyPlaybackClient.setVolume(percent);
      logSpotifyControlWrite({
        action: "volume",
        source: "api",
        status: res.status,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/volume",
        extra: { percent },
      });
    },
    [isSdkActive, playerRef],
  );

  const setRepeat = useCallback(
    async (state: string, deviceId?: string) => {
      const startedAt = Date.now();
      const res = await spotifyPlaybackClient.setRepeat(
        state as "track" | "context" | "off",
        deviceId,
      );
      logSpotifyControlWrite({
        action: "repeat",
        source: "api",
        status: res.status,
        durationMs: Date.now() - startedAt,
        endpoint: "/me/player/repeat",
        extra: { state, device_id: deviceId ?? null },
      });

      if (!res.ok) {
        throw new Error(`Spotify repeat update failed with status ${res.status}`);
      }
    },
    [],
  );

  const getCurrentlyPlaying = useCallback(async (): Promise<{
    status: number;
    playback: SpotifyPlayback | null;
  }> => spotifyPlaybackClient.getCurrentlyPlaying(), []);

  return {
    getCurrentlyPlaying,
    pause,
    play,
    resume,
    setRepeat,
    setVolume,
  };
}
