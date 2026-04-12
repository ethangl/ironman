import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConvexToken = vi.fn();

vi.mock("@/lib/convex-auth-client", () => ({
  convexAuthClient: {
    convex: {
      token: (...args: unknown[]) => mockConvexToken(...args),
    },
  },
}));

import {
  clearCachedConvexAuthToken,
  getCachedConvexAuthToken,
} from "./convex-auth-token";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function createJwt(expSecondsFromNow: number) {
  const header = encodeBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
    }),
  );

  return `${header}.${payload}.sig`;
}

function encodeBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

describe("getCachedConvexAuthToken", () => {
  beforeEach(() => {
    clearCachedConvexAuthToken();
    mockConvexToken.mockReset();
  });

  it("reuses a still-valid cached token", async () => {
    mockConvexToken.mockResolvedValue({
      data: { token: createJwt(300) },
    });

    await expect(getCachedConvexAuthToken()).resolves.toMatch(/\./);
    await expect(getCachedConvexAuthToken()).resolves.toMatch(/\./);

    expect(mockConvexToken).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent token fetches", async () => {
    const deferred = createDeferred<{ data: { token: string } }>();
    mockConvexToken.mockImplementation(
      () => deferred.promise,
    );

    const first = getCachedConvexAuthToken();
    const second = getCachedConvexAuthToken();

    expect(mockConvexToken).toHaveBeenCalledTimes(1);
    deferred.resolve({ data: { token: createJwt(300) } });

    await expect(first).resolves.toMatch(/\./);
    await expect(second).resolves.toMatch(/\./);
  });

  it("clears the cache when no token is returned", async () => {
    mockConvexToken.mockResolvedValue({ data: { token: null } });

    await expect(getCachedConvexAuthToken()).resolves.toBeNull();
    await expect(getCachedConvexAuthToken()).resolves.toBeNull();

    expect(mockConvexToken).toHaveBeenCalledTimes(2);
  });
});
