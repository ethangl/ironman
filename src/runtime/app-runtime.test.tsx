import { ReactNode } from "react";

import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpAppDataClient } from "@/data/client";
import { AppRuntimeProvider, useAppRuntime } from "./app-runtime";

const mockUseSession = vi.fn();
const mockGetAccessToken = vi.fn();
const mockSignInSocial = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  },
  signIn: {
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  signOut: (...args: unknown[]) => mockSignOut(...args),
  useSession: () => mockUseSession(),
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
  return (
    <AppRuntimeProvider dataClient={httpAppDataClient}>
      {children}
    </AppRuntimeProvider>
  );
}

describe("AppRuntimeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports a signed out status when there is no session", () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    expect(result.current.auth.isAuthenticated).toBe(false);
    expect(result.current.capabilities.hasSession).toBe(false);
    expect(result.current.capabilities.spotifyStatus.code).toBe("signed_out");
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(false);
    expect(result.current.capabilities.canControlPlayback).toBe(false);
    expect(result.current.capabilities.canUseIronman).toBe(false);
    expect(mockGetAccessToken).not.toHaveBeenCalled();
  });

  it("stays in a checking state while spotify access is still being verified", () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });

    const deferred = createDeferred<{ data?: { accessToken: string | null } }>();
    mockGetAccessToken.mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    expect(result.current.capabilities.hasSession).toBe(true);
    expect(result.current.capabilities.spotifyStatus.code).toBe("checking");
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(false);
    expect(result.current.capabilities.canControlPlayback).toBe(false);
    expect(result.current.capabilities.canUseIronman).toBe(false);

    deferred.resolve({ data: { accessToken: null } });
  });

  it("enables spotify-driven capabilities after confirming access", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockGetAccessToken.mockResolvedValue({
      data: { accessToken: "spotify-token" },
    });

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe("connected");
    });

    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(true);
    expect(result.current.capabilities.canControlPlayback).toBe(true);
    expect(result.current.capabilities.canUseIronman).toBe(true);
  });

  it("can recover from reconnect_required after fetching a fresh spotify token", async () => {
    let accessToken: string | null = null;

    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockGetAccessToken.mockImplementation(async () => ({
      data: { accessToken },
    }));

    const { result } = renderHook(() => useAppRuntime(), { wrapper });

    await waitFor(() => {
      expect(result.current.capabilities.spotifyStatus.code).toBe(
        "reconnect_required",
      );
    });
    expect(result.current.capabilities.canBrowsePersonalSpotify).toBe(false);

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
    expect(result.current.capabilities.canUseIronman).toBe(true);
  });
});
