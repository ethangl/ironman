import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppLink } from "./app-link";

describe("AppLink", () => {
  it("preserves the current search params for internal links", () => {
    render(
      <MemoryRouter initialEntries={["/artist/artist-1?roomId=room-1"]}>
        <AppLink href="/profile">Profile</AppLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile?roomId=room-1",
    );
  });

  it("preserves the current search params before the hash fragment", () => {
    render(
      <MemoryRouter initialEntries={["/artist/artist-1?roomId=room-1"]}>
        <AppLink href="/profile#top">Profile</AppLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile?roomId=room-1#top",
    );
  });

  it("does not override explicit search params on the href", () => {
    render(
      <MemoryRouter initialEntries={["/artist/artist-1?roomId=room-1"]}>
        <AppLink href="/profile?tab=activity">Profile</AppLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile?tab=activity",
    );
  });

  it("can skip preserving the current search params", () => {
    render(
      <MemoryRouter initialEntries={["/artist/artist-1?roomId=room-1"]}>
        <AppLink href="/profile" preserveSearch={false}>
          Profile
        </AppLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });
});
