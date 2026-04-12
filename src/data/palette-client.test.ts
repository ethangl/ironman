import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAction = vi.fn();
const mockExtractPaletteInBrowser = vi.fn();

vi.mock("convex/browser", () => ({
  ConvexHttpClient: class MockConvexHttpClient {
    action(...args: unknown[]) {
      return mockAction(...args);
    }
  },
}));

vi.mock("@api", () => ({
  api: {
    palette: {
      extract: "palette.extract",
    },
  },
}));

vi.mock("@/lib/browser-palette", () => ({
  extractPaletteInBrowser: (...args: unknown[]) =>
    mockExtractPaletteInBrowser(...args),
}));

import { createConvexPaletteClient } from "./palette-client";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("createConvexPaletteClient", () => {
  beforeEach(() => {
    mockAction.mockReset();
    mockExtractPaletteInBrowser.mockReset();
  });

  it("uses browser extraction before falling back to Convex", async () => {
    mockExtractPaletteInBrowser.mockResolvedValue(["client-1", "client-2"]);

    const client = createConvexPaletteClient("https://convex.example");

    await expect(client.get("https://image.example/client.jpg")).resolves.toEqual([
      "client-1",
      "client-2",
    ]);
    expect(mockExtractPaletteInBrowser).toHaveBeenCalledWith(
      "https://image.example/client.jpg",
    );
    expect(mockAction).not.toHaveBeenCalled();
  });

  it("falls back to Convex when browser extraction fails", async () => {
    mockExtractPaletteInBrowser.mockRejectedValue(new Error("cors blocked"));
    mockAction.mockResolvedValue(["server-1", "server-2"]);

    const client = createConvexPaletteClient("https://convex.example");

    await expect(client.get("https://image.example/server.jpg")).resolves.toEqual([
      "server-1",
      "server-2",
    ]);
    expect(mockAction).toHaveBeenCalledWith("palette.extract", {
      imageUrl: "https://image.example/server.jpg",
    });
  });

  it("deduplicates in-flight palette lookups for the same artwork url", async () => {
    const deferred = createDeferred<string[]>();
    mockExtractPaletteInBrowser.mockImplementation(
      () => deferred.promise,
    );

    const client = createConvexPaletteClient("https://convex.example");

    const first = client.get("https://image.example/cached.jpg");
    const second = client.get("https://image.example/cached.jpg");

    expect(mockExtractPaletteInBrowser).toHaveBeenCalledTimes(1);
    deferred.resolve(["cached-1", "cached-2"]);

    await expect(first).resolves.toEqual(["cached-1", "cached-2"]);
    await expect(second).resolves.toEqual(["cached-1", "cached-2"]);
    expect(mockAction).not.toHaveBeenCalled();
  });
});
