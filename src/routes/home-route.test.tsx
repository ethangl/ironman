import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { HomeRoute } from "./home-route";

const mockUseAppAuth = vi.fn();
vi.mock("@/app/app-runtime", () => ({
  useAppAuth: () => mockUseAppAuth(),
}));

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/apple-home" element={<div>apple home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HomeRoute", () => {
  it("redirects an existing session to the Apple home", () => {
    mockUseAppAuth.mockReturnValue({
      session: { user: { id: "guest-1" } },
      isPending: false,
    });

    renderHome();

    expect(screen.getByText("apple home")).toBeInTheDocument();
  });

  it("shows a transient pending state (no login wall) while the guest session is created", () => {
    mockUseAppAuth.mockReturnValue({ session: null, isPending: false });

    renderHome();

    expect(screen.queryByText("apple home")).not.toBeInTheDocument();
    // No Spotify sign-in affordance.
    expect(
      screen.queryByRole("button", { name: /spotify/i }),
    ).not.toBeInTheDocument();
  });
});
