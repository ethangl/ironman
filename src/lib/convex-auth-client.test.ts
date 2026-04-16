import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

vi.mock("@convex-dev/better-auth/client/plugins", () => ({
  convexClient: vi.fn(() => ({ id: "convex" })),
  crossDomainClient: vi.fn(() => ({ id: "cross-domain" })),
}));

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    $fetch: (...args: unknown[]) => mockFetch(...args),
    signIn: {},
    signOut: vi.fn(),
    useSession: vi.fn(),
  })),
}));

vi.mock("@/lib/convex-env", () => ({
  getConvexSiteUrl: vi.fn(() => "https://example.convex.site"),
}));

import { convexLinkSocialAccount } from "./convex-auth-client";

describe("convexLinkSocialAccount", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects the browser when link-social returns a URL", async () => {
    mockFetch.mockResolvedValue({
      data: {
        url: "https://accounts.spotify.com/authorize?foo=bar",
        redirect: false,
      },
      error: null,
    });
    const assignSpy = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign: assignSpy,
    });

    await convexLinkSocialAccount({
      provider: "spotify",
      callbackURL: "/",
      errorCallbackURL: "/?authProvider=spotify",
    });

    expect(mockFetch).toHaveBeenCalledWith("/link-social", {
      method: "POST",
      body: {
        provider: "spotify",
        callbackURL: "/",
        errorCallbackURL: "/?authProvider=spotify",
        disableRedirect: true,
      },
    });
    expect(assignSpy).toHaveBeenCalledWith(
      "https://accounts.spotify.com/authorize?foo=bar",
    );
  });

  it("does not redirect when link-social returns no URL", async () => {
    mockFetch.mockResolvedValue({
      data: {
        redirect: false,
      },
      error: null,
    });
    const assignSpy = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign: assignSpy,
    });

    await convexLinkSocialAccount({
      provider: "spotify",
    });

    expect(assignSpy).not.toHaveBeenCalled();
  });
});
