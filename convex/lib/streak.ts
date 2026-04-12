/**
 * Detects whether a song completed a full play based on progress changes.
 *
 * When Spotify loops a track (repeat mode = track), progress_ms jumps from
 * near the end back to near the start. We detect this transition.
 */
export function detectCompletion(
  wasNearTrackEnd: boolean,
  currProgressMs: number,
  durationMs: number,
  isPlaying: boolean,
): boolean {
  if (!isPlaying) return false;

  const restartThreshold = durationMs * 0.15;

  return wasNearTrackEnd && currProgressMs < restartThreshold;
}

export function isNearTrackEnd(
  progressMs: number,
  durationMs: number,
): boolean {
  return progressMs > durationMs * 0.85;
}
