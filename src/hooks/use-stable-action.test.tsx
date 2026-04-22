import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useCallback } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStableAction } from "./use-stable-action";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

function StableActionConsumer({
  enabled = true,
  keepDataOnLoad = true,
  mapError,
  load,
  value,
}: {
  enabled?: boolean;
  keepDataOnLoad?: boolean;
  mapError?: (error: unknown) => string | null;
  load: (value: string) => Promise<string | null>;
  value: string;
}) {
  const loadValue = useCallback(async () => {
    return await load(value);
  }, [load, value]);

  const { data, error, loading, refreshing, refresh, reload } =
    useStableAction<string>({
      enabled,
      keepDataOnLoad,
      load: loadValue,
      mapError,
    });

  return (
    <div>
      <div data-testid="data">{data ?? ""}</div>
      <div data-testid="error">{error ?? ""}</div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="refreshing">{String(refreshing)}</div>
      <button onClick={() => void refresh()}>Refresh</button>
      <button onClick={() => void reload()}>Reload</button>
    </div>
  );
}

describe("useStableAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignores stale results when a newer request completes first", async () => {
    const first = createDeferred<string | null>();
    const second = createDeferred<string | null>();
    const load = vi.fn((value: string) => {
      return value === "first" ? first.promise : second.promise;
    });

    const { rerender } = render(
      <StableActionConsumer load={load} value="first" />,
    );

    rerender(<StableActionConsumer load={load} value="second" />);

    second.resolve("second");

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent("second");
    });

    first.resolve("first");

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent("second");
    });
  });

  it("keeps current data visible while a refresh is in flight", async () => {
    const nextValue = createDeferred<string | null>();
    const load = vi
      .fn<(value: string) => Promise<string | null>>()
      .mockResolvedValueOnce("first")
      .mockImplementationOnce(() => nextValue.promise);

    render(<StableActionConsumer load={load} value="artist" />);

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent("first");
    });

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(screen.getByTestId("refreshing")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("data")).toHaveTextContent("first");

    nextValue.resolve("second");

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent("second");
    });
    expect(screen.getByTestId("refreshing")).toHaveTextContent("false");
  });

  it("clears state when disabled after an error", async () => {
    const load = vi.fn().mockRejectedValue(new Error("boom"));
    const mapError = vi.fn(() => "Could not load");

    const { rerender } = render(
      <StableActionConsumer
        load={load}
        mapError={mapError}
        value="artist"
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Could not load");
    });

    rerender(
      <StableActionConsumer
        enabled={false}
        load={load}
        mapError={mapError}
        value="artist"
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("");
    });
    expect(screen.getByTestId("data")).toHaveTextContent("");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });
});
