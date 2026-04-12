export const SPOTIFY_ACTIVITY_BOOTSTRAP_STORAGE_KEY_PREFIX =
  "spotify-activity-bootstrap:";
export const SPOTIFY_ARTIST_PAGE_STORAGE_KEY_PREFIX = "artist-page:";
export const SPOTIFY_FAVORITE_ARTISTS_STORAGE_KEY_PREFIX =
  "spotify-favorite-artists:";

const SPOTIFY_CLIENT_CACHE_KEY_PREFIXES = [
  SPOTIFY_ACTIVITY_BOOTSTRAP_STORAGE_KEY_PREFIX,
  SPOTIFY_ARTIST_PAGE_STORAGE_KEY_PREFIX,
  SPOTIFY_FAVORITE_ARTISTS_STORAGE_KEY_PREFIX,
];

export function clearSpotifyClientCaches() {
  if (typeof window === "undefined") {
    return 0;
  }

  const keysToRemove: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) {
      continue;
    }

    if (
      SPOTIFY_CLIENT_CACHE_KEY_PREFIXES.some((prefix) =>
        key.startsWith(prefix),
      )
    ) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    window.localStorage.removeItem(key);
  }

  return keysToRemove.length;
}
