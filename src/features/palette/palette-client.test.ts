import { beforeEach, describe, expect, it, vi } from "vitest";

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
  const loadPalette = vi.fn<(imageUrl: string) => Promise<string[]>>();

  beforeEach(() => {
    loadPalette.mockReset();
  });

  it("uses browser extraction", async () => {
    loadPalette.mockResolvedValue(["client-1", "client-2"]);

    const client = createPaletteClient(loadPalette);

    await expect(
      client.get("https://image.example/client.jpg"),
    ).resolves.toEqual(["client-1", "client-2"]);
    expect(loadPalette).toHaveBeenCalledWith("https://image.example/client.jpg");
  });

  it("rejects when browser extraction fails", async () => {
    loadPalette.mockRejectedValue(new Error("cors blocked"));

    const client = createPaletteClient(loadPalette);

    await expect(
      client.get("https://image.example/server.jpg"),
    ).rejects.toThrow("cors blocked");
  });

  it("deduplicates in-flight palette lookups for the same artwork url", async () => {
    const deferred = createDeferred<string[]>();
    loadPalette.mockImplementation(() => deferred.promise);

    const client = createPaletteClient(loadPalette);

    const first = client.get("https://image.example/cached.jpg");
    const second = client.get("https://image.example/cached.jpg");

    expect(loadPalette).toHaveBeenCalledTimes(1);
    deferred.resolve(["cached-1", "cached-2"]);

    await expect(first).resolves.toEqual(["cached-1", "cached-2"]);
    await expect(second).resolves.toEqual(["cached-1", "cached-2"]);
  });

  it("keeps cache scoped to each client instance", async () => {
    loadPalette.mockResolvedValue(["client-1"]);

    const firstClient = createPaletteClient(loadPalette);
    const secondClient = createPaletteClient(loadPalette);

    await expect(firstClient.get("https://image.example/cached.jpg")).resolves.toEqual([
      "client-1",
    ]);
    await expect(secondClient.get("https://image.example/cached.jpg")).resolves.toEqual([
      "client-1",
    ]);

    expect(loadPalette).toHaveBeenCalledTimes(2);
  });
});
