import { render, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginButton } from "./login-button";

const mockUseSession = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = vi.fn();
const mockSignInSocial = vi.fn();
const mockSignOut = vi.fn();
const mockToastError = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams(),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: () => mockUseSession(),
  signIn: {
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  signOut: () => mockSignOut(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("./avatar", () => ({
  Avatar: ({ name }: { name: string | null }) => <div>{name ?? "avatar"}</div>,
}));

function setSearchParams(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  mockSearchParams.mockReturnValue(searchParams);
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
    setSearchParams({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts Spotify sign-in when clicked outside cooldown", () => {
    render(<LoginButton />);

    fireEvent.click(screen.getByRole("button", { name: "Sign in with Spotify" }));

    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: "spotify",
      callbackURL: "/",
      errorCallbackURL: "/?authProvider=spotify",
    });
  });

  it("enters cooldown on unable_to_get_user_info and clears the auth query", async () => {
    setSearchParams({
      authProvider: "spotify",
      error: "unable_to_get_user_info",
      foo: "bar",
    });

    await act(async () => {
      render(<LoginButton />);
      await Promise.resolve();
    });

    expect(mockToastError).toHaveBeenCalledWith(
      "Spotify is cooling down. Try reconnecting in about a minute.",
    );
    const button = screen.getByRole("button", { name: /Spotify cooling down/i });
    expect(button).toBeDisabled();
    expect(localStorage.getItem("spotify-auth-cooldown-until")).toBe(
      String(Date.now() + 60_000),
    );
    expect(mockReplace).toHaveBeenCalledWith("/?foo=bar");
    expect(
      screen.getByText("Spotify asked us to slow down. Try reconnecting in about a minute."),
    ).toBeInTheDocument();
  });

  it("renders from persisted cooldown state and counts down", async () => {
    localStorage.setItem(
      "spotify-auth-cooldown-until",
      String(Date.now() + 15_000),
    );

    render(<LoginButton />);

    expect(screen.getByRole("button", { name: "Retry in 15s" })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("button", { name: "Retry in 14s" })).toBeDisabled();
  });
});
