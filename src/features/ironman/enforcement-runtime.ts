export const POLL_INTERVAL = 4000;
export const LEADER_KEY = "ironman:enforcement-leader";
export const LEADER_TTL_MS = 10_000;
export const LEADER_HEARTBEAT_MS = 3_000;
export const WRONG_SONG_CORRECTION_GRACE_MS = 3_000;

export function logEnforcement(
  message: string,
  details?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === "test") return;

  if (details && Object.keys(details).length > 0) {
    console.info("[enforcement]", message, details);
    return;
  }

  console.info("[enforcement]", message);
}

export function logEnforcementError(context: string, error: unknown) {
  if (process.env.NODE_ENV === "test") return;

  console.error("[enforcement]", context, error);
}
