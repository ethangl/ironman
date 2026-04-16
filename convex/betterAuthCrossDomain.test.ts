import { describe, expect, it, vi } from "vitest";

import { handleCrossDomainCallbackRedirect } from "./betterAuthCrossDomain";

describe("betterAuthCrossDomain", () => {
  it("does not log when a callback has no new session", async () => {
    const logger = {
      error: vi.fn(),
    };

    await expect(
      handleCrossDomainCallbackRedirect({
        context: {
          newSession: null,
          internalAdapter: {
            createVerificationValue: vi.fn(),
          },
          responseHeaders: new Headers(),
          logger,
        },
        redirect: vi.fn((url: string) => {
          throw new Error(url);
        }),
      }),
    ).resolves.toBeUndefined();

    expect(logger.error).not.toHaveBeenCalled();
  });
});
