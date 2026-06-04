import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateRandomString = vi.fn();

vi.mock("better-auth/crypto", () => ({
  generateRandomString: (...args: unknown[]) => mockGenerateRandomString(...args),
}));

import { handleCrossDomainCallbackRedirect } from "./betterAuthCrossDomain";

describe("betterAuthCrossDomain", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-23T12:00:00.000Z"));
    mockGenerateRandomString.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns without side effects when a callback has no new session", async () => {
    const createVerificationValue = vi.fn();
    const logger = {
      error: vi.fn(),
    };
    const redirect = vi.fn();

    await expect(
      handleCrossDomainCallbackRedirect({
        context: {
          newSession: null,
          internalAdapter: {
            createVerificationValue,
          },
          responseHeaders: new Headers(),
          logger,
        },
        redirect: redirect as never,
      }),
    ).resolves.toBeUndefined();

    expect(createVerificationValue).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("stores a one-time token and redirects with ott when a new session exists", async () => {
    mockGenerateRandomString.mockReturnValue("ott-123");

    const createVerificationValue = vi.fn().mockResolvedValue(undefined);
    const logger = {
      error: vi.fn(),
    };
    const redirect = vi.fn((url: string) => url as never);

    await expect(
      handleCrossDomainCallbackRedirect({
        context: {
          newSession: {
            session: {
              token: "session-token-1",
            },
          },
          internalAdapter: {
            createVerificationValue,
          },
          responseHeaders: new Headers({
            location: "https://example.com/callback?foo=bar",
          }),
          logger,
        },
        redirect,
      }),
    ).rejects.toBe("https://example.com/callback?foo=bar&ott=ott-123");

    expect(mockGenerateRandomString).toHaveBeenCalledWith(32);
    expect(createVerificationValue).toHaveBeenCalledWith({
      value: "session-token-1",
      identifier: "one-time-token:ott-123",
      expiresAt: new Date("2026-04-23T12:03:00.000Z"),
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("logs and stops when a new session exists without a redirect location", async () => {
    mockGenerateRandomString.mockReturnValue("ott-456");

    const createVerificationValue = vi.fn().mockResolvedValue(undefined);
    const logger = {
      error: vi.fn(),
    };
    const redirect = vi.fn((url: string) => url as never);

    await expect(
      handleCrossDomainCallbackRedirect({
        context: {
          newSession: {
            session: {
              token: "session-token-2",
            },
          },
          internalAdapter: {
            createVerificationValue,
          },
          responseHeaders: new Headers(),
          logger,
        },
        redirect,
      }),
    ).resolves.toBeUndefined();

    expect(createVerificationValue).toHaveBeenCalledWith({
      value: "session-token-2",
      identifier: "one-time-token:ott-456",
      expiresAt: new Date("2026-04-23T12:03:00.000Z"),
    });
    expect(logger.error).toHaveBeenCalledWith("No redirect to found");
    expect(redirect).not.toHaveBeenCalled();
  });
});
