/**
 * App-wide "is the Spotify token dead?" signal. A spotify Convex action that
 * fails with `SpotifyAuthRequired` (a 401/403 the request loop couldn't refresh
 * away) reports here; `useSpotifyRuntimeCapabilities` subscribes and flips
 * `spotifyConnection` to "disconnected" so the existing reconnect gate
 * (`require-authenticated-session.tsx`) takes over for every screen at once,
 * instead of each screen wiring its own error UI.
 *
 * A successful spotify action clears it (the token works again), as does a
 * session-user change. The reconnect flow itself redirects, which resets this
 * module state anyway.
 */
let authFailed = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function reportSpotifyAuthFailure() {
  if (authFailed) return;
  authFailed = true;
  emit();
}

export function clearSpotifyAuthFailure() {
  if (!authFailed) return;
  authFailed = false;
  emit();
}

export function getSpotifyAuthFailed() {
  return authFailed;
}

export function subscribeSpotifyAuthFailure(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
