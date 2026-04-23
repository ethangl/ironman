import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { Playlists } from "./playlists";

describe("Playlists", () => {
  it("renders playlist links with owner and track metadata", () => {
    render(
      <Playlists
        title="Your Playlists"
        playlists={[
          {
            id: "playlist-1",
            name: "Heavy Rotation",
            description: null,
            image: "playlist.jpg",
            owner: "ethan",
            public: true,
            trackCount: 12,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("link", {
        name: "Heavy Rotation 12 songs by ethan",
      }),
    ).toHaveAttribute("href", "/playlist/playlist-1");
  });

  it("renders pagination controls when provided", () => {
    render(
      <Playlists
        title="Your Playlists"
        playlists={[]}
        paginate={
          <Button variant="secondary" size="sm">
            Load more Playlists
          </Button>
        }
      />,
    );

    expect(
      screen.getByRole("button", { name: "Load more Playlists" }),
    ).toBeInTheDocument();
  });
});
