import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExtractPaletteInBrowser = vi.fn();

vi.mock("./browser-palette", () => ({
  extractPaletteInBrowser: (...args: unknown[]) =>
    mockExtractPaletteInBrowser(...args),
}));

import { createPaletteClient } from "./palette-client";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("createPaletteClient", () => {
  beforeEach(() => {
    mockExtractPaletteInBrowser.mockReset();
  });

  it("uses browser extraction", async () => {
    mockExtractPaletteInBrowser.mockResolvedValue(["client-1", "client-2"]);

    const client = createPaletteClient();

    await expect(
      client.get("https://image.example/client.jpg"),
    ).resolves.toEqual(["client-1", "client-2"]);
    expect(mockExtractPaletteInBrowser).toHaveBeenCalledWith(
      "https://image.example/client.jpg",
    );
  });

  it("rejects when browser extraction fails", async () => {
    mockExtractPaletteInBrowser.mockRejectedValue(new Error("cors blocked"));

    const client = createPaletteClient();

    await expect(
      client.get("https://image.example/server.jpg"),
    ).rejects.toThrow("cors blocked");
  });

  it("deduplicates in-flight palette lookups for the same artwork url", async () => {
    const deferred = createDeferred<string[]>();
    mockExtractPaletteInBrowser.mockImplementation(() => deferred.promise);

    const client = createPaletteClient();

    const first = client.get("https://image.example/cached.jpg");
    const second = client.get("https://image.example/cached.jpg");

    expect(mockExtractPaletteInBrowser).toHaveBeenCalledTimes(1);
    deferred.resolve(["cached-1", "cached-2"]);

    await expect(first).resolves.toEqual(["cached-1", "cached-2"]);
    await expect(second).resolves.toEqual(["cached-1", "cached-2"]);
  });
});
