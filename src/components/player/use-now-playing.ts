"use client";

import { useWebPlayer } from "@/hooks/use-web-player";

export function useNowPlaying() {
  const player = useWebPlayer();
  const { currentTrack, streak, sdkState, progressMs, durationMs } = player;

  const trackId = streak?.trackId ?? currentTrack?.id ?? null;
  const sdkActive = !!(sdkState && trackId && sdkState.trackId === trackId);
  const displayProgress = sdkActive ? sdkState!.position : progressMs;
  const displayDuration = sdkActive ? sdkState!.duration : durationMs;
  const pct =
    displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;

  const isPlaying = !!(currentTrack || streak?.active);

  const displayName = streak?.trackName ?? currentTrack?.name ?? "";
  const displayArtist = streak?.trackArtist ?? currentTrack?.artist ?? "";
  const displayImage = streak?.trackImage ?? currentTrack?.albumImage ?? null;
  const displayTrackId = streak?.trackId ?? currentTrack?.id ?? "";

  return {
    ...player,
    displayProgress,
    displayDuration,
    pct,
    isPlaying,
    displayName,
    displayArtist,
    displayImage,
    displayTrackId,
  };
}
