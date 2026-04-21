import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppRuntimeProvider } from "@/app/app-runtime";
import { LoginButton } from "./login-button";

const mockUseSession = vi.fn();
const mockUseBrowserSearchParams = vi.fn();
const mockReplaceBrowserUrl = vi.fn();
const mockFetchSpotifyAuthCooldown = vi.fn();
const mockLinkSocialAccount = vi.fn();
const mockSignInSocial = vi.fn();
const mockSignOut = vi.fn();
const mockToastError = vi.fn();

vi.mock("@/hooks/use-browser-search-params", () => ({
  useBrowserSearchParams: () => mockUseBrowserSearchParams(),
  replaceBrowserUrl: (...args: unknown[]) => mockReplaceBrowserUrl(...args),
}));

vi.mock("@/lib/convex-auth-client", () => ({
  fetchSpotifyAuthCooldown: (...args: unknown[]) =>
    mockFetchSpotifyAuthCooldown(...args),
  convexLinkSocialAccount: (...args: unknown[]) => mockLinkSocialAccount(...args),
  useConvexSession: () => mockUseSession(),
  convexSignIn: {
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  convexSignOut: () => mockSignOut(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

function setSearchParams(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  mockUseBrowserSearchParams.mockReturnValue(searchParams);
}

function renderLoginButton() {
  return render(
    <AppRuntimeProvider>
      <LoginButton />
    </AppRuntimeProvider>,
  );
}

async function settleSignedOutAuth() {
  await act(async () => {
    vi.advanceTimersByTime(400);
  });
}

describe("LoginButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T17:40:00.000Z"));
    localStorage.clear();
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });
    mockFetchSpotifyAuthCooldown.mockResolvedValue(null);
    setSearchParams({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts Spotify sign-in when clicked outside cooldown", async () => {
    renderLoginButton();
    await settleSignedOutAuth();

    fireEvent.click(
      screen.getByRole("button", { name: "Sign in with Spotify" }),
    );

    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: "spotify",
      callbackURL: "/",
      errorCallbackURL: "/?authProvider=spotify",
    });
    expect(mockLinkSocialAccount).not.toHaveBeenCalled();
  });

  it("uses account linking for reconnect when a session already exists", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });

    renderLoginButton();

    fireEvent.click(
      screen.getByRole("button", { name: "Reconnect Spotify" }),
    );

    expect(mockLinkSocialAccount).toHaveBeenCalledWith({
      provider: "spotify",
      callbackURL: "/",
      errorCallbackURL: "/?authProvider=spotify",
    });
    expect(mockSignInSocial).not.toHaveBeenCalled();
  });

  it("enters cooldown on unable_to_get_user_info and clears the auth query", async () => {
    setSearchParams({
      authProvider: "spotify",
      error: "unable_to_get_user_info",
      foo: "bar",
    });
    const cooldownStartedAt = Date.now();

    await act(async () => {
      renderLoginButton();
      await Promise.resolve();
    });
    await settleSignedOutAuth();

    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify is cooling down. Try reconnecting about a minute.",
    );
    const button = screen.getByRole("button", {
      name: /Spotify cooling down/i,
    });
    expect(button).toBeDisabled();
    expect(localStorage.getItem("spotify-auth-cooldown-until")).toBe(
      String(cooldownStartedAt + 60_000),
    );
    expect(mockReplaceBrowserUrl).toHaveBeenCalledWith("/?foo=bar");
    expect(
      screen.getByRole("button", { name: /Spotify cooling down/i }),
    ).toBeDisabled();
  });

  it("uses the backend cooldown window when available", async () => {
    setSearchParams({
      authProvider: "spotify",
      error: "unable_to_get_user_info",
    });
    mockFetchSpotifyAuthCooldown.mockResolvedValue({
      cooldownUntil: Date.now() + 2 * 60 * 60 * 1000,
      retryAfterSeconds: 7200,
    });

    await act(async () => {
      renderLoginButton();
      await Promise.resolve();
      await Promise.resolve();
    });
    await settleSignedOutAuth();

    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify is cooling down. Try reconnecting about 2 hours.",
    );
    expect(
      screen.getByRole("button", { name: /Spotify cooling down/i }),
    ).toBeDisabled();
  });

  it("preserves cooldown for reconnect flows when a session already exists", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    setSearchParams({
      authProvider: "spotify",
      error: "unable_to_get_user_info",
    });
    const cooldownStartedAt = Date.now();

    await act(async () => {
      renderLoginButton();
      await Promise.resolve();
    });

    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify is cooling down. Try reconnecting about a minute.",
    );
    expect(
      screen.getByRole("button", { name: /Spotify cooling down/i }),
    ).toBeDisabled();
    expect(localStorage.getItem("spotify-auth-cooldown-until")).toBe(
      String(cooldownStartedAt + 60_000),
    );
  });

  it("renders from persisted cooldown state and counts down", async () => {
    localStorage.setItem(
      "spotify-auth-cooldown-until",
      String(Date.now() + 15_000),
    );

    renderLoginButton();
    await settleSignedOutAuth();

    expect(screen.getByRole("button", { name: "Retry in 15s" })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("button", { name: "Retry in 14s" })).toBeDisabled();
  });
});
