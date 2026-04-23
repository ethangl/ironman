import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type LoadMode = "load" | "refresh";

export interface UseStableActionOptions<TData> {
  enabled?: boolean;
  initialData?: TData | null;
  keepDataOnLoad?: boolean;
  load: () => Promise<TData | null>;
  mapError?: (error: unknown) => string | null;
}

export interface UseStableActionResult<TData> {
  data: TData | null;
  dataRef: MutableRefObject<TData | null>;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<TData | null>;
  reload: () => Promise<TData | null>;
  requestVersionRef: MutableRefObject<number>;
  setData: Dispatch<SetStateAction<TData | null>>;
}

export function useStableAction<TData>({
  enabled = true,
  initialData = null,
  keepDataOnLoad = true,
  load,
  mapError,
}: UseStableActionOptions<TData>): UseStableActionResult<TData> {
  const [dataState, setDataState] = useState<TData | null>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialDataRef = useRef<TData | null>(initialData);
  const requestVersionRef = useRef(0);
  const dataRef = useRef<TData | null>(initialData);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const setData = useCallback<Dispatch<SetStateAction<TData | null>>>(
    (value) => {
      setDataState((current) => {
        const nextValue =
          typeof value === "function"
            ? (value as (currentValue: TData | null) => TData | null)(current)
            : value;
        dataRef.current = nextValue;
        return nextValue;
      });
    },
    [],
  );

  const run = useCallback(
    async (mode: LoadMode) => {
      if (!enabled) {
        return dataRef.current;
      }

      const requestVersion = ++requestVersionRef.current;
      setError(null);

      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setLoading(true);
        setRefreshing(false);
        if (!keepDataOnLoad) {
          setData(initialDataRef.current);
        }
      }

      try {
        const nextData = (await load()) ?? null;
        if (requestVersionRef.current !== requestVersion) {
          return dataRef.current;
        }

        setData(nextData);
        return nextData;
      } catch (nextError) {
        if (requestVersionRef.current !== requestVersion) {
          return dataRef.current;
        }

        if (mode === "load" && !keepDataOnLoad) {
          setData(initialDataRef.current);
        }

        setError(
          mapError
            ? mapError(nextError)
            : nextError instanceof Error
              ? nextError.message
              : "Could not load data right now.",
        );

        return dataRef.current;
      } finally {
        if (requestVersionRef.current === requestVersion) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [enabled, keepDataOnLoad, load, mapError, setData],
  );

  useEffect(() => {
    requestVersionRef.current += 1;

    if (!enabled) {
      setData(initialDataRef.current);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    void run("load");
  }, [enabled, run, setData]);

  const refresh = useCallback(async () => {
    return await run("refresh");
  }, [run]);

  const reload = useCallback(async () => {
    return await run("load");
  }, [run]);

  return {
    data: dataState,
    dataRef,
    error,
    loading,
    refreshing,
    refresh,
    reload,
    requestVersionRef,
    setData,
  };
}
