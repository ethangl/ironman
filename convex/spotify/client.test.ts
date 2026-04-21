import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSpotifyFetchState,
  spotifyFetch,
  spotifyFetchOptional,
} from "./client";

function createResponse({
  body = "",
  headers,
  ok,
  status,
}: {
  body?: string;
  headers?: Record<string, string>;
  ok: boolean;
  status: number;
}) {
  return {
    headers: {
      get(name: string) {
        return headers?.[name.toLowerCase()] ?? headers?.[name] ?? null;
      },
    },
    ok,
    status,
    text: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function createDeferredResponse() {
  let resolve!: (value: Response) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Response>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

describe("spotify shared client rate-limit cooldown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    clearSpotifyFetchState();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("fails fast on repeated strict fetches during an active retry-after cooldown", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      createResponse({
        ok: false,
        status: 429,
        headers: { "retry-after": "30" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      spotifyFetch("/artists/artist-1", "spotify-token"),
    ).rejects.toMatchObject({
      status: 429,
      retryAfterSeconds: 30,
    });

    await expect(
      spotifyFetch("/artists/artist-1", "spotify-token"),
    ).rejects.toMatchObject({
      status: 429,
      retryAfterSeconds: 30,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns fallback for optional fetches during an active cooldown", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      createResponse({
        ok: false,
        status: 429,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      spotifyFetchOptional("/search?q=gojira&type=track", "spotify-token", {
        tracks: [],
      }),
    ).resolves.toEqual({
      tracks: [],
    });

    await expect(
      spotifyFetchOptional("/search?q=gojira&type=track", "spotify-token", {
        tracks: [],
      }),
    ).resolves.toEqual({
      tracks: [],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("allows requests again after the fallback cooldown expires", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse({
          ok: false,
          status: 429,
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          ok: true,
          status: 200,
          body: JSON.stringify({ country: "US" }),
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    await expect(spotifyFetch("/me", "spotify-token")).rejects.toMatchObject({
      status: 429,
      retryAfterSeconds: null,
    });

    await vi.advanceTimersByTimeAsync(5_000);

    await expect(
      spotifyFetch<{ country: string }>("/me", "spotify-token"),
    ).resolves.toEqual({
      country: "US",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("dedupes concurrent identical GET requests", async () => {
    const deferred = createDeferredResponse();
    const fetchMock = vi.fn().mockReturnValue(deferred.promise);

    vi.stubGlobal("fetch", fetchMock);

    const first = spotifyFetch<{ country: string }>("/me", "spotify-token");
    const second = spotifyFetch<{ country: string }>("/me", "spotify-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    deferred.resolve(
      createResponse({
        ok: true,
        status: 200,
        body: JSON.stringify({ country: "US" }),
      }),
    );

    await expect(Promise.all([first, second])).resolves.toEqual([
      { country: "US" },
      { country: "US" },
    ]);
  });

  it("issues a fresh GET request after the previous identical one settles", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse({
          ok: true,
          status: 200,
          body: JSON.stringify({ country: "US" }),
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          ok: true,
          status: 200,
          body: JSON.stringify({ country: "CA" }),
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      spotifyFetch<{ country: string }>("/me", "spotify-token"),
    ).resolves.toEqual({ country: "US" });
    await expect(
      spotifyFetch<{ country: string }>("/me", "spotify-token"),
    ).resolves.toEqual({ country: "CA" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
