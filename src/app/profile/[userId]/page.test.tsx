import { Suspense } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PublicProfilePage from "./page";

vi.mock("./profile-view", () => ({
  ProfileView: ({ data }: { data: { user: { name: string } } }) => (
    <div data-testid="profile-view">{data.user.name}</div>
  ),
}));

describe("PublicProfilePage", () => {
  it("recovers after navigating from a missing user to a valid user", async () => {
    vi.spyOn(global, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/api/profile/missing")) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      if (url.endsWith("/api/profile/found")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user: { id: "user-1", name: "Found User", image: null },
              stats: {
                totalPlays: 0,
                totalStreaks: 0,
                uniqueSongs: 0,
                weaknessCount: 0,
              },
              bestStreak: null,
              activeStreak: null,
              history: [],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        );
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    let rerender: ReturnType<typeof render>["rerender"];
    await act(async () => {
      ({ rerender } = render(
        <Suspense fallback={<div>Loading...</div>}>
          <PublicProfilePage params={Promise.resolve({ userId: "missing" })} />
        </Suspense>,
      ));
    });

    await waitFor(() => {
      expect(screen.getByText("User not found.")).toBeInTheDocument();
    });

    await act(async () => {
      rerender(
        <Suspense fallback={<div>Loading...</div>}>
          <PublicProfilePage params={Promise.resolve({ userId: "found" })} />
        </Suspense>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("profile-view")).toHaveTextContent("Found User");
    });
    expect(screen.queryByText("User not found.")).not.toBeInTheDocument();
  });
});
