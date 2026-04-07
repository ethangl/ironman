import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProfilePage from "./page";

vi.mock("@/app/profile/[userId]/profile-view", () => ({
  ProfileView: ({ data }: { data: { user: { name: string } } }) => (
    <div data-testid="profile-view">{data.user.name}</div>
  ),
}));

describe("ProfilePage", () => {
  it("shows the signed-out message when /api/profile responds with 401", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<ProfilePage />);

    await waitFor(() => {
      expect(
        screen.getByText("Sign in to see your profile."),
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId("profile-view")).not.toBeInTheDocument();
  });
});
