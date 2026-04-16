import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockBetterAuth = vi.fn();
const mockConvexPlugin = vi.fn().mockReturnValue({ id: "convex-plugin" });
const mockCrossDomainPlugin = vi.fn().mockReturnValue({ id: "cross-domain-plugin" });
const mockAdapter = vi.fn().mockReturnValue({ adapter: true });

vi.mock("better-auth", () => ({
  betterAuth: (options: unknown) => mockBetterAuth(options),
}));

vi.mock("@convex-dev/better-auth", () => ({
  createClient: vi.fn(() => ({
    adapter: () => mockAdapter(),
    clientApi: () => ({
      getAuthUser: vi.fn(),
    }),
  })),
}));

vi.mock("@convex-dev/better-auth/utils", () => ({
  isRunMutationCtx: vi.fn(() => true),
}));

vi.mock("@convex-dev/better-auth/plugins", () => ({
  convex: (options: unknown) => mockConvexPlugin(options),
  crossDomain: (options: unknown) => mockCrossDomainPlugin(options),
}));

vi.mock("./_generated/api", () => ({
  components: {
    betterAuth: {},
    spotify: {
      cache: {
        set: "spotify.cache.set",
      },
    },
  },
}));

describe("convex/betterAuth", () => {
  const originalEnv = {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
    SITE_URL: process.env.SITE_URL,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret";
    process.env.CONVEX_SITE_URL = "https://example.convex.site";
    process.env.SITE_URL = "https://example.com";
    process.env.SPOTIFY_CLIENT_ID = "spotify-client";
    process.env.SPOTIFY_CLIENT_SECRET = "spotify-secret";
  });

  afterEach(() => {
    process.env.BETTER_AUTH_SECRET = originalEnv.BETTER_AUTH_SECRET;
    process.env.CONVEX_SITE_URL = originalEnv.CONVEX_SITE_URL;
    process.env.SITE_URL = originalEnv.SITE_URL;
    process.env.SPOTIFY_CLIENT_ID = originalEnv.SPOTIFY_CLIENT_ID;
    process.env.SPOTIFY_CLIENT_SECRET = originalEnv.SPOTIFY_CLIENT_SECRET;
  });

  it("trusts Spotify for explicit account linking", async () => {
    mockBetterAuth.mockImplementation((options) => options);

    const { createAuth } = await import("./betterAuth");

    const auth = createAuth({
      runMutation: vi.fn(),
    } as never) as unknown as {
      account?: {
        accountLinking?: {
          trustedProviders?: string[];
        };
      };
    };

    expect(auth.account?.accountLinking?.trustedProviders).toEqual(["spotify"]);
  });
});
