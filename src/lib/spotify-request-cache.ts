type CacheEntry<T> = {
  expiresAt: number;
  inFlight: Promise<T> | null;
  value?: T;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function setCachedSpotifyResult<T>(
  key: string,
  value: T,
  ttlMs: number,
) {
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    inFlight: null,
    value,
  });
}

export async function getCachedSpotifyResult<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
  options?: {
    allowStaleOnError?: boolean;
    onEvent?: (event: "hit" | "join" | "miss" | "store" | "stale") => void;
  },
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (entry?.value !== undefined && entry.expiresAt > now) {
    options?.onEvent?.("hit");
    return entry.value;
  }

  if (entry?.inFlight) {
    options?.onEvent?.("join");
    return entry.inFlight;
  }

  options?.onEvent?.("miss");
  const nextEntry: CacheEntry<T> = {
    expiresAt: entry?.expiresAt ?? 0,
    inFlight: null,
    value: entry?.value,
  };

  const inFlight = loader()
    .then((value) => {
      nextEntry.value = value;
      nextEntry.expiresAt = Date.now() + ttlMs;
      nextEntry.inFlight = null;
      cache.set(key, nextEntry);
      options?.onEvent?.("store");
      return value;
    })
    .catch((error) => {
      nextEntry.inFlight = null;
      cache.set(key, nextEntry);
      if (options?.allowStaleOnError && nextEntry.value !== undefined) {
        options?.onEvent?.("stale");
        return nextEntry.value;
      }
      throw error;
    });

  nextEntry.inFlight = inFlight;
  cache.set(key, nextEntry);
  return inFlight;
}
