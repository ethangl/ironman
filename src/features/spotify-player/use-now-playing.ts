import { useWebPlayer } from "./use-web-player";

export function useNowPlaying() {
  const player = useWebPlayer();
  const { currentTrack, sdkState, progressMs, durationMs } = player;

  const trackId = currentTrack?.id ?? null;
  const sdkActive = !!(sdkState && trackId && sdkState.trackId === trackId);
  const displayProgress = sdkActive ? sdkState!.position : progressMs;
  const displayDuration = sdkActive
    ? sdkState!.duration
    : currentTrack?.durationMs ?? durationMs;
  const pct =
    displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;

  const isPlaying = !!currentTrack;

  const displayName = currentTrack?.name ?? "";
  const displayArtist = currentTrack?.artist ?? "";
  const displayImage = currentTrack?.albumImage ?? null;
  const displayTrackId = currentTrack?.id ?? "";

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
