import type { ActionCtx } from "../_generated/server";

import { components } from "../_generated/api";

export async function fetchPlaybackCurrentlyPlaying(
  ctx: ActionCtx,
  accessToken: string,
) {
  return ctx.runAction(components.spotify.playback.currentlyPlaying, {
    accessToken,
  });
}

export async function playPlaybackUri(
  ctx: ActionCtx,
  args: {
    accessToken: string;
    uri: string;
    deviceId?: string;
    offsetMs?: number;
  },
) {
  return ctx.runAction(components.spotify.playback.play, args);
}

export async function resumePlayback(ctx: ActionCtx, accessToken: string) {
  return ctx.runAction(components.spotify.playback.resume, {
    accessToken,
  });
}

export async function pausePlayback(ctx: ActionCtx, accessToken: string) {
  return ctx.runAction(components.spotify.playback.pause, {
    accessToken,
  });
}

export async function setPlaybackRepeat(
  ctx: ActionCtx,
  args: {
    accessToken: string;
    state: "track" | "context" | "off";
    deviceId?: string;
  },
) {
  return ctx.runAction(components.spotify.playback.setRepeat, args);
}

export async function setPlaybackVolume(
  ctx: ActionCtx,
  args: {
    accessToken: string;
    percent: number;
  },
) {
  return ctx.runAction(components.spotify.playback.setVolume, args);
}
