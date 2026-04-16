import { v } from "convex/values";

import {
  getCurrentlyPlaying,
  pausePlayback,
  playUri,
  resumePlayback,
  setRepeatMode,
  setVolumePercent,
} from "./playbackApi";
import { action } from "./_generated/server";

const playbackArtistValidator = v.object({
  name: v.string(),
});

const playbackItemValidator = v.union(
  v.object({
    id: v.string(),
    name: v.string(),
    duration_ms: v.number(),
    artists: v.optional(v.array(playbackArtistValidator)),
  }),
  v.null(),
);

const playbackStateValidator = v.union(
  v.object({
    is_playing: v.boolean(),
    progress_ms: v.number(),
    item: playbackItemValidator,
  }),
  v.null(),
);

const playResultValidator = v.object({
  ok: v.boolean(),
  retryAfterSeconds: v.optional(v.number()),
  status: v.number(),
});

export const currentlyPlaying = action({
  args: {
    accessToken: v.string(),
  },
  returns: v.object({
    retryAfterSeconds: v.optional(v.number()),
    status: v.number(),
    playback: playbackStateValidator,
  }),
  handler: async (_ctx, args) => getCurrentlyPlaying(args.accessToken),
});

export const play = action({
  args: {
    accessToken: v.string(),
    uri: v.string(),
    deviceId: v.optional(v.string()),
  },
  returns: playResultValidator,
  handler: async (_ctx, args) =>
    playUri(args.uri, args.accessToken, args.deviceId),
});

export const resume = action({
  args: {
    accessToken: v.string(),
  },
  returns: playResultValidator,
  handler: async (_ctx, args) => resumePlayback(args.accessToken),
});

export const pause = action({
  args: {
    accessToken: v.string(),
  },
  returns: playResultValidator,
  handler: async (_ctx, args) => pausePlayback(args.accessToken),
});

export const setRepeat = action({
  args: {
    accessToken: v.string(),
    state: v.union(v.literal("track"), v.literal("context"), v.literal("off")),
    deviceId: v.optional(v.string()),
  },
  returns: playResultValidator,
  handler: async (_ctx, args) =>
    setRepeatMode(args.state, args.accessToken, args.deviceId),
});

export const setVolume = action({
  args: {
    accessToken: v.string(),
    percent: v.number(),
  },
  returns: playResultValidator,
  handler: async (_ctx, args) =>
    setVolumePercent(args.percent, args.accessToken),
});
