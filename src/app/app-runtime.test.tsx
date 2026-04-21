import { ReactNode } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearCachedSpotifyAccessToken } from "@/app/lib/spotify-access-token";
import { clearCachedSpotifyAccountLink } from "@/app/lib/spotify-account-link";
import { AppRuntimeProvider, useAppRuntime } from "./app-runtime";

const mockUseSession = vi.fn();
const mockGetAccessToken = vi.fn();
const mockAuthFetch = vi.fn();
const mockSignInSocial = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/convex-auth-client", () => ({
  convexAuthClient: {
    $fetch: (...args: unknown[]) => mockAuthFetch(...args),
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  },
  convexSignIn: {
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  convexSignOut: (...args: unknown[]) => mockSignOut(...args),
  useConvexSession: () => mockUseSession(),
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function wrapper({ children }: { children: ReactNode }) {
  return <AppRuntimeProvider>{children}</AppRuntimeProvider>;
}

describe("AppRuntimeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCachedSpotifyAccessToken();
    clearCachedSpotifyAccountLink();
  });

  it("reports a signed out status after the session settle delay when there is no session", async () => {
    vi.useFakeTimers();
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    expect(result.current.capabilities.spotifyStatus.code).toBe("checking");

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.auth.isAuthenticated).toBe(false);
    expect(result.current.capabilities.hasSession).toBe(false);
    expect(result.current.capabilities.spotifyStatus.code).toBe("signed_out");
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(false);
    expect(result.current.capabilities.canControlPlayback).toBe(false);
    expect(mockAuthFetch).not.toHaveBeenCalled();
    expect(mockGetAccessToken).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("stays in a checking state while spotify account linkage is still being verified", () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });

    const deferred =
      createDeferred<
        { providerId: string; id: string; accountId: string; userId: string }[]
      >();
    mockAuthFetch.mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    expect(result.current.capabilities.hasSession).toBe(true);
    expect(result.current.capabilities.spotifyStatus.code).toBe("checking");
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(false);
    expect(result.current.capabilities.canControlPlayback).toBe(false);
    expect(mockGetAccessToken).not.toHaveBeenCalled();

    deferred.resolve([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);
  });

  it("enables spotify-driven capabilities after confirming a linked spotify account", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockAuthFetch.mockResolvedValue([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    });

    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(true);
    expect(result.current.capabilities.canControlPlayback).toBe(true);
    expect(mockGetAccessToken).not.toHaveBeenCalled();
  });

  it("keeps browsing enabled but disables playback after a spotify token fetch fails", async () => {
    let accessToken: string | null = null;

    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockAuthFetch.mockResolvedValue([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);
    mockGetAccessToken.mockImplementation(async () => ({
      data: { accessToken },
    }));

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    });

    await act(async () => {
      await expect(result.current.auth.getSpotifyAccessToken()).resolves.toBe(
        null,
      );
    });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe(
        "reconnect_required",
      );
    });
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(false);
    expect(result.current.capabilities.canControlPlayback).toBe(false);

    accessToken = "fresh-token";

    await act(async () => {
      await expect(result.current.auth.getSpotifyAccessToken()).resolves.toBe(
        "fresh-token",
      );
    });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    });
    expect(result.current.capabilities.canControlPlayback).toBe(true);
  });

  it("does not bounce back to checking when the same session user re-renders", async () => {
    const sessionValue = {
      data: { user: { id: "user-1" } },
      isPending: false,
    };

    mockUseSession.mockImplementation(() => sessionValue);
    mockAuthFetch.mockResolvedValue([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);

    const { result, rerender } = renderHook(() => useAppRuntime(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    });

    sessionValue.data = { user: { id: "user-1" } };
    rerender();

    expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    expect(mockAuthFetch).toHaveBeenCalledTimes(1);
    expect(mockGetAccessToken).not.toHaveBeenCalled();
  });

  it("keeps personal spotify capabilities during a pending revalidation for the same user", async () => {
    const sessionState: {
      data: { user: { id: string } } | null;
      isPending: boolean;
    } = {
      data: { user: { id: "user-1" } },
      isPending: false,
    };

    mockUseSession.mockImplementation(() => sessionState);
    mockAuthFetch.mockResolvedValue([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);

    const { result, rerender } = renderHook(() => useAppRuntime(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    });
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(true);

    sessionState.data = null;
    sessionState.isPending = true;
    await act(async () => {
      rerender();
    });

    expect(result.current.capabilities.spotifyStatus.code).toBe("checking");
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(true);
    expect(result.current.capabilities.canControlPlayback).toBe(true);
  });

  it("does not flash signed_out if a session appears during the settle window", async () => {
    vi.useFakeTimers();
    const sessionState: {
      data: { user: { id: string } } | null;
      isPending: boolean;
    } = {
      data: null,
      isPending: true,
    };

    mockUseSession.mockImplementation(() => sessionState);
    mockAuthFetch.mockResolvedValue([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);

    const { result, rerender } = renderHook(() => useAppRuntime(), { wrapper });

    expect(result.current.capabilities.spotifyStatus.code).toBe("checking");

    sessionState.isPending = false;
    sessionState.data = null;
    await act(async () => {
      rerender();
    });

    expect(result.current.capabilities.spotifyStatus.code).toBe("checking");

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    sessionState.data = { user: { id: "user-1" } };
    await act(async () => {
      rerender();
      await Promise.resolve();
    });

    expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    vi.useRealTimers();
  });

  it("does not flash reconnect_required while a new session's spotify check is still pending", async () => {
    const sessionState: {
      data: { user: { id: string } } | null;
      isPending: boolean;
    } = {
      data: null,
      isPending: false,
    };

    const deferred =
      createDeferred<
        { providerId: string; id: string; accountId: string; userId: string }[]
      >();

    mockUseSession.mockImplementation(() => sessionState);
    mockAuthFetch.mockImplementation(() => deferred.promise);

    const { result, rerender } = renderHook(() => useAppRuntime(), { wrapper });

    await act(async () => {
      vi.useFakeTimers();
      vi.advanceTimersByTime(400);
      vi.useRealTimers();
    });

    sessionState.data = { user: { id: "user-1" } };
    await act(async () => {
      rerender();
    });

    expect(result.current.capabilities.spotifyStatus.code).toBe("checking");

    deferred.resolve([
      {
        providerId: "spotify",
        id: "account-1",
        accountId: "spotify-account-1",
        userId: "user-1",
      },
    ]);

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    });
  });

  it("throws when used outside the runtime provider", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    expect(() => renderHook(() => useAppRuntime())).toThrow(
      "useAppRuntime must be used within an AppRuntimeProvider.",
    );
  });
});
