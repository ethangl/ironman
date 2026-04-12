import { useCallback, useEffect, useMemo, useState } from "react";

type CachedValueEntry<T> = {
  expiresAt: number;
  value: T;
};

const cachedQueryMemory = new Map<string, CachedValueEntry<unknown>>();

function readCachedValue<T>(cacheKey: string, now = Date.now()): T | undefined {
  const memoryEntry = cachedQueryMemory.get(cacheKey) as
    | CachedValueEntry<T>
    | undefined;
  if (memoryEntry) {
    if (memoryEntry.expiresAt > now) {
      return memoryEntry.value;
    }

    cachedQueryMemory.delete(cacheKey);
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) {
      return undefined;
    }

    const entry = JSON.parse(raw) as CachedValueEntry<T>;
    if (!entry || entry.expiresAt <= now) {
      window.localStorage.removeItem(cacheKey);
      return undefined;
    }

    cachedQueryMemory.set(cacheKey, entry as CachedValueEntry<unknown>);
    return entry.value;
  } catch {
    window.localStorage.removeItem(cacheKey);
    return undefined;
  }
}

function writeCachedValue<T>(cacheKey: string, value: T, ttlMs: number) {
  const entry = {
    expiresAt: Date.now() + ttlMs,
    value,
  };

  cachedQueryMemory.set(cacheKey, entry as CachedValueEntry<unknown>);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // Ignore storage failures and fall back to memory/network.
  }
}

export interface UseCachedQueryOptions<T> {
  cacheKey: string | null;
  queryFn: () => Promise<T>;
  ttlMs: number;
  enabled?: boolean;
  initialData?: T;
}

export interface UseCachedQueryResult<T> {
  data: T | undefined;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCachedQuery<T>({
  cacheKey,
  queryFn,
  ttlMs,
  enabled = true,
  initialData,
}: UseCachedQueryOptions<T>): UseCachedQueryResult<T> {
  const cachedValue = useMemo(
    () =>
      (cacheKey && enabled ? readCachedValue<T>(cacheKey) : undefined) ??
      initialData,
    [cacheKey, enabled, initialData],
  );
  const [data, setData] = useState<T | undefined>(cachedValue);
  const [loading, setLoading] = useState(() => enabled && cachedValue === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData(undefined);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    setData(cachedValue);
    setLoading(cachedValue === undefined);
    setRefreshing(false);
    setError(null);
  }, [cachedValue, enabled]);

  const refresh = useCallback(async () => {
    if (!enabled || !cacheKey) {
      return;
    }

    const hasCachedValue = readCachedValue<T>(cacheKey) !== undefined;
    setLoading(!hasCachedValue);
    setRefreshing(hasCachedValue);

    try {
      const nextData = await queryFn();
      writeCachedValue(cacheKey, nextData, ttlMs);
      setData(nextData);
      setError(null);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not load cached data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cacheKey, enabled, queryFn, ttlMs]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  };
}
